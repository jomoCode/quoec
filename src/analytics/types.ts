/**
 * The analytics contract. Every tracked event in the app must fit these types.
 * Rows in the backend `analytics_events` table and GA4 events are both derived from `AnalyticsEvent`.
 */

/** Bump when the event shape changes so old/new rows can be told apart. */
export const SCHEMA_VERSION = 1;

/**
 * Event names: specific actions, snake_case, <= 40 chars (GA4 rules).
 * Avoid GA4 reserved names (page_view, session_start, first_visit, ...).
 * Mark conversions as "key events" in GA4 by these names.
 */
export type EventName =
  | 'cta_click' // a call-to-action was clicked (intent)
  | 'generate_lead' // an enquiry was successfully submitted (conversion) — GA4 recommended name
  | 'project_view' // a development came into view / was opened
  | 'nav_click' // internal navigation
  | 'outbound_click'; // link leaving the site

export type AnalyticsPriority = 'conversion' | 'engagement' | 'navigation';

/**
 * Tag registry: one entry per trackable element. Mirrors the `analytics_tags` table.
 * Adding a tag here is the only way to make it trackable, so tags can't drift or be misspelled.
 */
export const TAGS = {
  nav_enquire_now: {
    description: 'Navbar "Enquire Now" button (desktop)',
    priority: 'engagement',
  },
  nav_mobile_enquire_now: {
    description: 'Navbar "Enquire Now" button (mobile menu)',
    priority: 'engagement',
  },
  contact_form_submit: {
    description: 'Contact section enquiry form, successful submission',
    priority: 'conversion',
  },
} as const satisfies Record<string, { description: string; priority: AnalyticsPriority }>;

export type AnalyticsTag = keyof typeof TAGS;

/** Flat values only — GA4 can't take nested objects. Never put user-typed values here. */
export type AnalyticsMeta = Record<string, string | number | boolean>;

/** What a component passes in. Everything else is filled in by `track()`. */
export interface TrackInput {
  name: EventName;
  tag: AnalyticsTag;
  meta?: AnalyticsMeta;
  /**
   * Count at most once per session ('session') or once per page per session ('page').
   * Use for intent/impression events where repeats add noise, not signal.
   */
  once?: 'session' | 'page';
}

export interface AnalyticsEvent {
  event_id: string; // idempotency key — backend rejects duplicates
  name: EventName;
  tag: AnalyticsTag;
  priority: AnalyticsPriority;
  visitor_id: string;
  session_id: string;
  seq: number; // order within the session
  page_path: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: 'mobile' | 'tablet' | 'desktop';
  viewport_width: number;
  language: string;
  env: 'prod' | 'dev';
  schema_version: number;
  client_ts: string; // ISO; server adds its own server_ts
  meta?: AnalyticsMeta;
}
