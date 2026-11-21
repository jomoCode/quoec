# Quo public website

This is a frontend-only React/Vite project. It has no Express server or local database.

## Setup

Prerequisites: Node.js and npm.

1. Install dependencies:
   ```sh
   npm install
   ```
2. Copy `.env.example` to `.env` and configure:
   - `VITE_API_BASE_URL` — separate backend origin.
   - `VITE_ANALYTICS_ENDPOINT` — optional analytics ingestion endpoint.
   - `VITE_GA_MEASUREMENT_ID` — optional GA4 measurement ID.
3. Start the frontend:
   ```sh
   npm run dev
   ```
4. Build for deployment:
   ```sh
   npm run build
   ```

## API contract

The required backend endpoints and JSON request/response shapes are documented in:

- [`docs/backend-api.md`](docs/backend-api.md)
- [`docs/analytics.md`](docs/analytics.md)
