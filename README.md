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
| `VITE_API_BASE_URL` | Origin of the backend API, e.g. `https://api.example.com`. If unset, the app calls same-origin paths like `/api/developments`. |
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

- `GET /api/developments` — list of public developments in display order
- `POST /api/enquiries` — submit a contact/enquiry form
- `POST /api/analytics` — batched analytics events (optional)

Request/response shapes, error format, the admin app contract and CORS requirements are in [docs/backend-api.md](docs/backend-api.md). `data/portfolio.json` contains example development records in the expected shape.

Media paths such as `/media/properties/the-citadel-facade.jpg` are served from this frontend's `public/` folder unless the API returns full URLs.

## Analytics

The site tracks a small set of anonymous visitor actions (e.g. "Enquire Now" clicks and sent enquiries) along with campaign/referrer source. No form contents or personal details are recorded. Events can go to the backend, GA4, or both.

To exclude your own browser from analytics (team traffic), visit any page once with `?internal=1`; use `?internal=0` to undo.

See [docs/analytics.md](docs/analytics.md) for the full design and how to track new events.

## Deployment

```sh
npm run build
```

Deploy the contents of `dist/` to any static host. Make sure:

- The `VITE_*` variables are set at **build time** (Vite inlines them into the bundle).
- The backend allows the site's origin via CORS.

The build also copies `src/assets/` into `dist/src/assets/` so root-relative image URLs keep working in production — see the custom plugin in [vite.config.ts](vite.config.ts).
