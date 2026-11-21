# Backend API Contract

Set the backend origin in `.env`:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_ANALYTICS_ENDPOINT=https://api.example.com/api/analytics
```

If `VITE_API_BASE_URL` is unset, the frontend calls same-origin paths such as `/api/developments`. If it is set, it prefixes API paths with the configured origin.

## General conventions

- Send and receive JSON using `Content-Type: application/json`.
- Return `4xx` or `5xx` responses with:

```json
{
  "error": "Human-readable error message"
}
```

- The frontend reads `error` from this shape and displays it to the user.
- ISO timestamps use ISO-8601 strings, for example `2026-11-21T12:30:00.000Z`.
- Relative asset paths such as `/media/properties/the-citadel-facade.jpg` are served from the frontend origin unless a full URL is supplied.

## Public developments

### `GET /api/developments`

Returns every public development in display order.

**Response: `200 OK`**

```json
[
  {
    "id": "the-citadel",
    "name": "The Citadel",
    "location": "Abuja, Nigeria",
    "description": "Our flagship boutique development.",
    "status": "Ongoing",
    "featured": true,
    "displayOrder": 1,
    "isComingSoon": false,
    "externalUrl": "https://quoec.com/",
    "featuredImage": "/media/properties/the-citadel-facade.jpg",
    "galleryImages": [
      "/media/properties/the-citadel-facade.jpg",
      "/media/properties/the-citadel-pool.jpg"
    ],
    "featuredVideo": "/media/properties/the-citadel.mp4",
    "residenceSummary": "8 Boutique Residences · Secured Lobby",
    "updatedAt": "2026-11-21T12:30:00.000Z"
  }
]
```

### Development shape

| Field              | Type                                     | Required | Notes                                                            |
| ------------------ | ---------------------------------------- | -------: | ---------------------------------------------------------------- |
| `id`               | string                                   |      yes | Stable unique identifier/slug.                                   |
| `name`             | string                                   |      yes | Property name.                                                   |
| `location`         | string                                   |      yes | Display location.                                                |
| `description`      | string                                   |      yes | Public property description.                                     |
| `status`           | `"Upcoming" \| "Ongoing" \| "Completed"` |      yes | Development lifecycle status.                                    |
| `featured`         | boolean                                  |      yes | Controls featured-property presentation.                         |
| `displayOrder`     | number                                   |      yes | Lower numbers should appear first.                               |
| `isComingSoon`     | boolean                                  |      yes | If true, the website may show a coming-soon presentation.        |
| `externalUrl`      | string                                   |      yes | Empty string is valid. Should be an absolute URL when populated. |
| `featuredImage`    | string                                   |      yes | Full or relative image URL.                                      |
| `galleryImages`    | string[]                                 |      yes | Full or relative image URLs.                                     |
| `featuredVideo`    | string                                   |       no | Full or relative video URL.                                      |
| `residenceSummary` | string                                   |       no | Short supporting summary.                                        |
| `updatedAt`        | string                                   |      yes | ISO-8601 timestamp.                                              |

The response should be sorted by `displayOrder` ascending. The frontend also sorts defensively.

## Public enquiries

### `POST /api/enquiries`

Creates an enquiry submitted by the website contact form.

**Request**

```json
{
  "fullName": "Adaeze Okafor",
  "email": "adaeze@example.com",
  "phone": "+2348000000000",
  "propertyInterest": "The Citadel",
  "message": "I would like to arrange a private viewing."
}
```

| Field              | Type   | Required | Notes                                       |
| ------------------ | ------ | -------: | ------------------------------------------- |
| `fullName`         | string |      yes | Must not be empty after trimming.           |
| `email`            | string |      yes | Must be a valid email address.              |
| `phone`            | string |       no | May be an empty string.                     |
| `propertyInterest` | string |       no | Development name or general portfolio text. |
| `message`          | string |      yes | Must not be empty after trimming.           |

**Success: `201 Created`**

```json
{
  "id": "enq-1763730000000-a1b2c3",
  "fullName": "Adaeze Okafor",
  "email": "adaeze@example.com",
  "phone": "+2348000000000",
  "propertyInterest": "The Citadel",
  "message": "I would like to arrange a private viewing.",
  "status": "New",
  "createdAt": "2026-11-21T12:30:00.000Z"
}
```

Validation errors should return `400 Bad Request` using the common `error` shape.

### Enquiry shape

| Field              | Type                                 | Notes                                   |
| ------------------ | ------------------------------------ | --------------------------------------- |
| `id`               | string                               | Stable unique identifier.               |
| `fullName`         | string                               | Customer name.                          |
| `email`            | string                               | Customer email.                         |
| `phone`            | string                               | Customer phone number; may be empty.    |
| `propertyInterest` | string                               | Development or general enquiry context. |
| `message`          | string                               | Customer's enquiry.                     |
| `status`           | `"New" \| "Contacted" \| "Archived"` | Enquiry lifecycle status.               |
| `createdAt`        | string                               | ISO-8601 creation timestamp.            |

## Analytics

`VITE_ANALYTICS_ENDPOINT` controls the analytics destination. The transport posts batches to that URL, which may be a same-origin or cross-origin endpoint.

### `POST /api/analytics`

**Request**

```json
{
  "events": [
    {
      "website_id": "quo-public-website",
      "event_id": "unique-event-id",
      "name": "generate_lead",
      "tag": "contact_form_submit",
      "priority": "conversion",
      "visitor_id": "visitor-id",
      "session_id": "session-id",
      "seq": 4,
      "page_path": "/",
      "device_type": "desktop",
      "viewport_width": 1440,
      "language": "en-US",
      "env": "prod",
      "schema_version": 3,
      "client_ts": "2026-11-21T12:30:00.000Z",
      "referrer": null,
      "utm_source": null,
      "utm_medium": null,
      "utm_campaign": null,
      "utm_term": null,
      "utm_content": null,
      "gclid": null,
      "fbclid": null,
      "meta": {
        "property_interest": "The Citadel"
      }
    }
  ]
}
```

- `website_id` identifies the source website and must be stored as a filterable indexed column. Use `WHERE website_id = 'quo-public-website'` to isolate this website's events.
- `event_id` is the idempotency key. Store each event once. It may be unique within the website or combined with `website_id` if event IDs can overlap across websites.
- Send a successful response for accepted batches.
- A `4xx` response other than `429` tells the frontend to drop the batch.
- `429` or network failure leaves events queued for retry.
- Batches contain at most 20 events.
- `meta` contains only string, number, or boolean values.

The complete analytics type contract is in `src/analytics/types.ts`.

## Separate admin application contract

The public website no longer contains an admin panel. A separate admin application may use these routes to manage the shared backend:

| Method   | Endpoint                    | Purpose                                    |
| -------- | --------------------------- | ------------------------------------------ |
| `GET`    | `/api/developments`         | List developments.                         |
| `POST`   | `/api/developments`         | Create a development.                      |
| `PUT`    | `/api/developments/:id`     | Update or partially patch a development.   |
| `POST`   | `/api/developments/reorder` | Reorder by ordered IDs.                    |
| `DELETE` | `/api/developments/:id`     | Delete a development.                      |
| `GET`    | `/api/enquiries`            | List enquiries, newest first if supported. |
| `PATCH`  | `/api/enquiries/:id`        | Update enquiry status.                     |
| `DELETE` | `/api/enquiries/:id`        | Delete an enquiry.                         |
| `POST`   | `/api/upload`               | Upload a development image.                |

These routes should require authentication and authorization in the admin application domain. They must not be exposed as unauthenticated public mutations on the website API.

### Create/update development request

Creation and update may use the public development fields. `id`, `updatedAt`, and server-generated fields should be ignored or generated by the backend.

```json
{
  "name": "The Citadel",
  "location": "Abuja, Nigeria",
  "description": "Our flagship boutique development.",
  "residenceSummary": "8 Boutique Residences · Secured Lobby",
  "status": "Ongoing",
  "featured": true,
  "displayOrder": 1,
  "isComingSoon": false,
  "externalUrl": "https://quoec.com/",
  "featuredImage": "/uploads/citadel-facade.jpg",
  "galleryImages": ["/uploads/citadel-facade.jpg"]
}
```

### Reorder request

```json
{
  "orderedIds": ["the-citadel", "pavillion-villas", "aurora-gardens"]
}
```

Return the complete reordered development array.

### Update enquiry status

```json
{
  "status": "Contacted"
}
```

Return the complete updated enquiry object.

### Image upload

The website's former admin implementation submitted a JSON base64 payload:

```json
{
  "fileName": "facade.jpg",
  "dataUrl": "data:image/jpeg;base64,..."
}
```

For a cleaner new admin implementation, multipart upload is also acceptable:

```text
Content-Type: multipart/form-data
field: file
```

**Upload success: `201 Created`**

```json
{
  "url": "/uploads/facade-a1b2c3.jpg"
}
```

## CORS

When the frontend and backend use different origins, the backend must allow:

- The public website origin.
- The separate admin application origin, if that app calls the API directly.
- `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` methods.
- `Authorization` and `Content-Type` headers.

Credentials and wildcard origins must be configured carefully. Do not use `Access-Control-Allow-Origin: *` for authenticated admin routes.
