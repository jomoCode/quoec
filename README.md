# Quo Developments — Public Website

The public marketing site for **Quo Engineering & Construction Limited**, showcasing luxury residential developments across Abuja and Accra (The Citadel, Pavillion Villas, The Urbane and more).

It is a **frontend-only** React + Vite single-page app. It has no server or database of its own: development listings and enquiry submissions go through a separate backend API, described in [docs/backend-api.md](docs/backend-api.md).

## Tech stack

- [React 19](https://react.dev) + TypeScript
- [Vite](https://vite.dev) for dev server and builds
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- [Motion](https://motion.dev) for animation
- [lucide-react](https://lucide.dev) icons

## Getting started

Prerequisites: Node.js (LTS) and npm.

```sh
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

The dev server prints a local URL (by default http://localhost:5173).

### Environment variables

All variables are optional; the site runs without them, but developments and enquiries need a backend.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | citadel-api host, e.g. `https://citadel-api.kojoansah.workers.dev`. `/api/v1` is added automatically. If unset, the site shows the built-in content from `data/portfolio.json`. |
| `VITE_WEBSITE_ID` | This site's id on the backend, sent as `X-Website-Id`. Defaults to `quoec`. |
| `VITE_CONTENT_FALLBACK` | `seed` (default) shows `data/portfolio.json` if the API is unset or unreachable; `none` shows nothing. |
| `VITE_ANALYTICS_SITE_ID` | Identifier for this site in a shared analytics database. Defaults to `quo-public-website`. |
| `VITE_ANALYTICS_ENDPOINT` | Backend endpoint that accepts batched analytics events (`POST { events: [...] }`). |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 ID (`G-XXXXXXXXXX`). gtag is loaded automatically when set. |

With no analytics endpoint or GA ID configured, events are only logged to the browser console.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Type-check with `tsc --noEmit` |

## Project structure

```
├── data/portfolio.json      Sample development data (matches the API's Development shape)
├── docs/
│   ├── backend-api.md       Backend endpoints and JSON contracts
│   └── analytics.md         How visitor analytics work
├── public/
│   └── media/properties/    Property photos and videos served at /media/...
├── src/
│   ├── App.tsx              Page layout; fetches developments on load
│   ├── components/          Page sections (Navbar, Developments, Featured, Contact, Footer, ...)
│   ├── analytics/           Event tracking: track → identity → transport
│   ├── types/property.ts    Development type definitions
│   └── utils/               API URL helper, environment detection, storage, misc
├── index.html
└── vite.config.ts
```

## Backend API

The site relies on these endpoints from the external backend:

The backend is [citadel-api](../citadel-api). Every request sends `X-Website-Id: quoec`.

- `GET /api/v1/public/developments` — published developments for the `quoec` site (snake_case; mapped to the `Development` type in [src/utils/developments.ts](src/utils/developments.ts))
- `POST /api/v1/public/enquiries` — contact form ([src/utils/enquiries.ts](src/utils/enquiries.ts)); needs `name`, `email`, `phone`, `enquiryType`, a message of 10+ characters and `consent_given: true`
- Errors come back as `{ "error": { "code", "message", "details": { "fields": {...} } } }`

Analytics: citadel-api's `POST /api/v1/public/events` takes one `{ event, properties, path }` per request, which does not match this site's batched format, so leave `VITE_ANALYTICS_ENDPOINT` unset for now.

[docs/backend-api.md](docs/backend-api.md) describes the original, pre-citadel-api contract.

### Seeding production

`data/portfolio.json` is also the seed for the backend. [scripts/seed-production.py](scripts/seed-production.py) uploads its images to the Supabase `marketing` bucket and upserts the rows for the `quoec` site. It is a dry run unless you pass `--apply`.

Media paths such as `/media/properties/the-citadel-facade.jpg` are served from this frontend's `public/` folder unless the API returns full URLs.

## Analytics

The site tracks a small set of anonymous visitor actions (e.g. "Enquire Now" clicks and sent enquiries) along with campaign/referrer source. No form contents or personal details are recorded. Events can go to the backend, GA4, or both.

To exclude your own browser from analytics (team traffic), visit any page once with `?internal=1`; use `?internal=0` to undo.

See [docs/analytics.md](docs/analytics.md) for the full design and how to track new events.

## Deployment (Cloudflare)

The site deploys to Cloudflare as a static-assets Worker, configured in [wrangler.jsonc](wrangler.jsonc). Unknown paths fall back to `index.html`, and [public/_headers](public/_headers) sets security headers and caching (hashed `/assets/*` files are cached permanently, media for a day).

### From your machine

```sh
npx wrangler login     # once
npm run deploy         # builds, then runs wrangler deploy
```

`npm run cf:dev` builds the site and serves it locally through Wrangler, so you can check headers and the SPA fallback before deploying.

### From Git (Workers Builds)

In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository** and use:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Build variables | `VITE_API_BASE_URL`, `VITE_ANALYTICS_ENDPOINT`, `VITE_GA_MEASUREMENT_ID`, `VITE_ANALYTICS_SITE_ID` |

The Node version is pinned to 22 in [.node-version](.node-version).

To use **Cloudflare Pages** instead, set the build command to `npm run build` and the output directory to `dist`. Pages also reads `_headers` and serves a single-page app automatically.

### Things to check

- Set the `VITE_*` variables as **build** variables. Vite inlines them into the bundle, so runtime variables have no effect.
- Set `VITE_API_BASE_URL`. This Worker serves static files only, so same-origin `/api/...` requests would get `index.html` back instead of data.
- The backend must allow the site's domain (and any `*.workers.dev` preview URL) through CORS.
- Cloudflare limits each static file to 25 MiB. The largest video is currently about 14 MB. Host larger videos on R2 or Cloudflare Stream.

The build also copies `src/assets/` into `dist/src/assets/` so root-relative image URLs keep working in production — see the custom plugin in [vite.config.ts](vite.config.ts).
