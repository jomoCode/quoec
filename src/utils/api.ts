/**
 * The one place that knows how to reach citadel-api.
 *
 * - VITE_API_BASE_URL: the bare backend host, e.g. https://citadel-api.kojoansah.workers.dev.
 *   `/api/v1` is added here, so don't include it.
 * - VITE_WEBSITE_ID: which website this is on the backend (sent as `X-Website-Id`). Defaults to `quoec`.
 */

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");

export const WEBSITE_ID =
  import.meta.env.VITE_WEBSITE_ID?.trim().toLowerCase() || "quoec";

const API_PREFIX = "/api/v1";

/** True when a backend is configured. Without one the site shows its built-in content. */
export const hasApi = API_ORIGIN.length > 0;

export function apiUrl(path: string): string {
  return `${API_ORIGIN}${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Error body the backend returns: `{ error: { code, message, details? } }`. */
interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: { fields?: Record<string, string> };
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Website-Id", WEBSITE_ID);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(apiUrl(path), { ...init, headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(
      body.error?.message || `Request failed (${res.status})`,
      res.status,
      body.error?.code,
      body.error?.details?.fields,
    );
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
