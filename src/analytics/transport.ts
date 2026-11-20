import type { AnalyticsEvent } from './types';
import { local, readJSON, removeKey, writeJSON } from '../utils/storage';

/**
 * The only file that knows where events go.
 * - Backend: set VITE_ANALYTICS_ENDPOINT (e.g. /api/analytics). Receives { events: AnalyticsEvent[] }.
 *   It must insert with `on conflict (event_id) do nothing` — retries and beacons may resend events.
 * - GA4: set VITE_GA_MEASUREMENT_ID. gtag is loaded automatically.
 * With neither set (or in dev), events are logged to the console.
 */

const ENDPOINT: string | undefined = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const GA_ID: string | undefined = import.meta.env.VITE_GA_MEASUREMENT_ID;

const QUEUE_KEY = 'qa_queue';
const MAX_BATCH = 20;
const MAX_QUEUE = 200; // cap so an offline device can't grow storage forever
const FLUSH_INTERVAL_MS = 5000;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Queue is persisted so events survive offline periods and page closes.
// Each event keeps its event_id, so a resend is deduped server-side.
let queue: AnalyticsEvent[] = readJSON<AnalyticsEvent[]>(local, QUEUE_KEY) ?? [];
let flushing = false;
let initialised = false;

function persist() {
  if (queue.length) writeJSON(local, QUEUE_KEY, queue.slice(-MAX_QUEUE));
  else removeKey(local, QUEUE_KEY);
}

export function initTransport() {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;

  if (GA_ID) loadGtag(GA_ID);

  if (ENDPOINT) {
    window.setInterval(() => void flush(), FLUSH_INTERVAL_MS);
    window.addEventListener('online', () => void flush());
    // Last chance before the page goes away (tab close, navigation, app switch on mobile).
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushWithBeacon();
    });
    window.addEventListener('pagehide', flushWithBeacon);
    void flush(); // send anything left over from a previous visit
  }
}

export function send(event: AnalyticsEvent) {
  sendToGA(event);

  if (!ENDPOINT || event.env === 'dev') {
    console.debug('[analytics]', event.name, event.tag, event);
    if (!ENDPOINT) return;
  }

  queue.push(event);
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
  persist();
  if (queue.length >= MAX_BATCH) void flush();
}

async function flush() {
  if (!ENDPOINT || flushing || !queue.length || !navigator.onLine) return;
  flushing = true;
  const batch = queue.slice(0, MAX_BATCH);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });
    // 4xx (other than 429) means the batch itself is bad — drop it rather than retry forever.
    if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
      const sent = new Set(batch.map((e) => e.event_id));
      queue = queue.filter((e) => !sent.has(e.event_id));
      persist();
    }
  } catch {
    // Network error: keep the events and retry on the next interval / when back online.
  } finally {
    flushing = false;
  }
}

function flushWithBeacon() {
  if (!ENDPOINT || !queue.length || typeof navigator.sendBeacon !== 'function') return;
  const blob = new Blob([JSON.stringify({ events: queue.slice(0, MAX_BATCH) })], {
    type: 'application/json',
  });
  // sendBeacon gives no delivery confirmation, so events stay queued; if they are resent
  // next visit, the backend's event_id uniqueness drops the duplicates.
  navigator.sendBeacon(ENDPOINT, blob);
}

// ---- GA4 ----

function loadGtag(id: string) {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

function sendToGA(event: AnalyticsEvent) {
  if (!window.gtag || event.env === 'dev') return;
  // GA4: flat params, values <= 100 chars, max 25 params. meta is spread to top level.
  const params: Record<string, string | number | boolean> = {
    tag: event.tag,
    priority: event.priority,
    page_path: event.page_path,
    visitor_id: event.visitor_id,
    event_id: event.event_id,
    schema_version: event.schema_version,
  };
  for (const [k, v] of Object.entries(event.meta ?? {})) {
    if (Object.keys(params).length >= 25) break;
    if (!(k in params)) params[k] = v;
  }
  for (const k of Object.keys(params)) {
    const v = params[k];
    if (typeof v === 'string' && v.length > 100) params[k] = v.slice(0, 100);
  }
  window.gtag('event', event.name, params);
}
