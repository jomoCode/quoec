/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WEBSITE_ID?: string;
  readonly VITE_CONTENT_FALLBACK?: string;
  readonly VITE_ANALYTICS_SITE_ID?: string;
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
