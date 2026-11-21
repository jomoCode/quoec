# Analytics

## Summary

The website records a small number of important visitor actions. Today those are clicks on "Enquire Now" and sent enquiry forms. It also records where each visitor came from, such as an Instagram ad, Google or a newsletter. With this, we can answer questions like:

- How many people asked about a property this week?
- Which ad or campaign brought those people?
- Do people enquire more on mobile or desktop?

Visitors are anonymous. We don't record names, emails, phone numbers or anything typed into forms. Data can go to our own backend, to Google Analytics 4, or to both. Nothing goes anywhere until it's configured.

## How it works

```
Visitor clicks a tracked button
        │
        ▼
track()                 checks the event: skips bots, our own team, accidental double clicks
        │
        ▼
identity                adds who/when/where: anonymous visitor ID, session, campaign source
        │
        ▼
transport               sends it: queues events, sends in batches, retries if offline
        │
        ├──► Our backend          (if VITE_ANALYTICS_ENDPOINT is set)
        └──► Google Analytics 4   (if VITE_GA_MEASUREMENT_ID is set)
```

## File map

| File                         | What it does                                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/analytics/types.ts`     | The rules. Lists every allowed event name and every trackable button (the "tags"), and the exact shape of a recorded event. |
| `src/analytics/track.ts`     | The front door. Components call `track()` or `withTracking()`. It filters out junk and builds the event.                    |
| `src/analytics/identity.ts`  | Remembers the anonymous visitor and their current session, and works out where the session came from.                       |
| `src/analytics/transport.ts` | The only file that knows where data goes. Handles queuing, batching, retries and Google Analytics.                          |
| `src/analytics/index.ts`     | What the rest of the app may import.                                                                                        |
| `src/utils/storage.ts`       | Safe saving to the browser's storage. Never crashes, even when storage is blocked.                                          |
| `src/utils/uuid.ts`          | Creates unique IDs.                                                                                                         |
| `src/utils/environment.ts`   | Works out whether the visitor is a bot, which device type they're on, and whether we're in dev or live.                     |

Tracked today: the Navbar "Enquire Now" buttons (desktop and mobile) and a successful contact form submission.

## What each event contains

- **Where it came from:** `website_id` identifies the website that generated the event. This is required when multiple websites write to the same analytics database.
- **What happened:** the event name (e.g. `generate_lead`), which button it was, and how important it is (conversion, engagement or navigation).
- **Who (anonymous):** a random visitor ID kept in the browser, plus a session ID.
- **Where from:** the referring website, the campaign tags (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) and ad click IDs (`gclid` for Google, `fbclid` for Meta).
- **Context:** the page, device type, screen width, language, and whether it's dev or live.
- **Housekeeping:** a unique event ID, the event's order within its session, a timestamp and a schema version.

## Decisions

1. **Only track what matters.** Each trackable button must be listed in `TAGS` first, so tracking can't spread or be misspelled. Unlisted tags are ignored.
2. **Anonymous by design.** We use random IDs, not personal details. Form contents are never sent. For referrers we keep only the website name (e.g. `www.google.com`), not the full link, which can contain personal search terms.
3. **Analytics must never break the site.** Every step is wrapped so errors are swallowed. If storage is blocked (e.g. private browsing), tracking quietly does less instead of crashing.
4. **A session ends after 30 minutes of inactivity**, the same rule Google Analytics uses. All tabs share one session so visits aren't double-counted.
5. **Where a visitor came from is recorded once, when the session starts**, and copied onto every event in it. Later clicks keep the campaign that brought the visitor in.
6. **Campaign links must be tagged by us.** Ads don't add UTM tags by default. Add them in the ad platform (Meta's "URL parameters", Google Ads' "Final URL suffix") or with Google's Campaign URL Builder. Untagged visits still show the referring site and ad click IDs, when available.
7. **Noise is filtered out:**
   - **Bots and automated browsers** are ignored.
   - **Our own team** can opt out: visit any page once with `?internal=1` (undo with `?internal=0`).
   - **The same click repeated within 1 second** counts once.
   - **"Once" events** count at most once per session, or once per page per session.
8. **No event is lost when the network fails.** Events wait in a saved queue and are sent in batches of up to 20 every 5 seconds. Sending is retried when the device comes back online and attempted once more when the page closes. The queue is capped at 200 events.
9. **Duplicates are expected and handled by the backend.** Retries can resend an event, so every event has a unique ID and the backend ignores repeats.
10. **Dev data is labelled, not mixed in.** Local and dev-server events are marked `env: dev`, logged to the browser console, and never sent to Google Analytics.
11. **One switch per destination.** Setting an environment variable turns a destination on. Nothing in the components changes.
12. **The event format is versioned.** `SCHEMA_VERSION` (currently 3) goes up whenever the event shape changes, so old and new data can be told apart.
13. **General helpers live in `src/utils/`.** Storage, ID and environment helpers aren't analytics-specific, so other features can reuse them. Analytics depends on utils, never the other way round.
14. **Every website has a stable analytics identifier.** `VITE_ANALYTICS_SITE_ID` defaults to `quo-public-website` and must remain unchanged for the lifetime of this website. It separates this site's events from other websites in a shared database and is sent to both the backend and GA4 as `website_id`.
15. **Retry deduplication includes the website.** Backends should use `(website_id, event_id)` as the deduplication identity when event IDs might overlap between websites. Tables and indexes should include `website_id` for efficient filtering.

## Setup

In `.env` (see `.env.example`):

```
VITE_ANALYTICS_SITE_ID=quo-public-website  # unique ID for this website in a shared database
VITE_ANALYTICS_ENDPOINT=                   # our backend URL, e.g. /api/analytics
VITE_GA_MEASUREMENT_ID=                    # e.g. G-XXXXXXXXXX
```

`VITE_ANALYTICS_SITE_ID` should be set explicitly in production. If omitted, the frontend uses the default `quo-public-website` value. With neither destination configured, events are only printed in the browser console.

**Backend requirements:** accept `POST { events: [...] }` and store each event once. Store `website_id` on every row and index it for filtering. Deduplicate with `(website_id, event_id)` where supported (`on conflict (website_id, event_id) do nothing`).

## Tracking something new

1. Add the button to `TAGS` in `types.ts` with a short description and priority.
2. In the component, wrap its click handler:

   ```tsx
   <button onClick={withTracking({ name: 'cta_click', tag: 'my_new_tag' }, handleClick)}>
   ```

   or call `track({ name, tag })` directly, e.g. after a form is sent successfully.

3. If you need a new event name, add it to `EventName` in `types.ts` and keep it `snake_case`.
