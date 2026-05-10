# Bolomj API Endpoints

Base URL:

```txt
https://api.bolomj.space
```

JSON requests should send:

```http
Accept: application/json
Content-Type: application/json
```

Authenticated requests must send:

```http
Authorization: Bearer <accessToken>
```

## Response Wrappers

Frontend API clients must not assume one response shape:

| Shape | Used by |
| --- | --- |
| `{ "data": ... }` | Most read endpoints and tour/admin mutations. |
| `{ "accessToken": "...", "user": {...} }` | `POST /auth/login`. |
| `{ "message": "...", "booking": {...} }` | Booking create/status endpoints. |
| Direct object | `GET /auth/me`, health endpoints. |

## Health

### `GET /health`

Public.

```json
{
  "ok": true,
  "message": "API is running"
}
```

### `GET /db-health`

Public.

```json
{
  "ok": true,
  "dbTime": "2026-05-06T16:35:36.793Z"
}
```

## Auth

### `POST /auth/login`

Public. Used for implemented backend roles such as `system_admin`, `tenant_admin`, and any existing `user` account with a valid password.

Request validation:

```ts
{
  email: string; // valid email
  password: string; // min length 6
}
```

Response:

```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "admin@bolomj.space",
    "role": "system_admin",
    "tenant_id": null,
    "first_name": "System",
    "last_name": "Admin"
  }
}
```

Error responses:

- `400` invalid body
- `401` invalid email or password
- `403` user is inactive

### `GET /auth/me`

Auth required.

Response is a direct object, not wrapped in `data`:

```json
{
  "id": "uuid",
  "email": "tenant@example.com",
  "role": "tenant_admin",
  "tenant_id": "uuid",
  "first_name": "Tenant",
  "last_name": "Admin"
}
```

## Marketplace Tours

### `GET /public/marketplace/tours`

Public. Returns tours where:

```txt
tours.status = published
tours.published_to_marketplace = true
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "title": "Tokyo Sakura Tour",
      "slug": "tokyo-sakura-tour",
      "description": "Tour description",
      "destination_country": "Japan",
      "destination_city": "Tokyo",
      "duration_days": 5,
      "capacity": 20,
      "price": "2500000",
      "currency": "MNT",
      "start_date": "2026-06-01",
      "end_date": "2026-06-05",
      "meeting_point": "Ulaanbaatar Airport",
      "includes_text": "Hotel, guide",
      "excludes_text": "Personal expenses",
      "status": "published",
      "is_featured": true,
      "published_to_marketplace": true,
      "created_at": "2026-05-01T00:00:00.000Z",
      "updated_at": "2026-05-01T00:00:00.000Z",
      "tenant_name": "Nomad Travel",
      "tenant_slug": "nomad",
      "tenant_subdomain": "nomad"
    }
  ]
}
```

### `GET /public/marketplace/tours/:id`

Public. Same marketplace visibility rule as the list endpoint.

Returns `404` with `{ "message": "Tour not found" }` when unavailable.

### Legacy aliases

These currently map to the same marketplace handlers:

```http
GET /tours
GET /tours/:id
```

New frontends should prefer `/public/marketplace/tours`.

## Tenant Public Website

### `GET /public/tenants/by-slug/:slug`

Public. Returns active tenant profile plus website settings.

Response:

```json
{
  "data": {
    "id": "uuid",
    "name": "Nomad Travel",
    "slug": "nomad",
    "registration_number": "1234567",
    "email": "info@nomad.mn",
    "phone": "99999999",
    "logo_url": null,
    "banner_url": null,
    "description": "Travel agency description",
    "website_subdomain": "nomad",
    "marketplace_enabled": true,
    "status": "active",
    "created_at": "2026-05-01T00:00:00.000Z",
    "updated_at": "2026-05-01T00:00:00.000Z",
    "website": {
      "id": "uuid",
      "site_title": "Nomad Travel",
      "hero_title": "Nomad Travel tours",
      "hero_subtitle": "Choose and book your trip",
      "about_text": "About text",
      "contact_email": "info@nomad.mn",
      "contact_phone": "99999999",
      "address": "Ulaanbaatar",
      "primary_color": "#2563eb",
      "secondary_color": "#0f172a",
      "facebook_url": null,
      "instagram_url": null,
      "whatsapp_url": null
    }
  }
}
```

### `GET /public/tenants/:slug/tours`

Public. Returns published tours for an active tenant.

### `GET /public/tenants/:slug/tours/:tourSlug`

Public. Returns one published tour for an active tenant.

### `POST /public/tenants/:slug/bookings`

Public in the current backend. There is no `app.authenticate` pre-handler on this route.

Request validation:

```ts
{
  tour_id: string; // uuid
  customer_first_name: string;
  customer_last_name?: string | null;
  customer_email: string; // valid email
  customer_phone?: string | null;
  traveler_count: number; // integer >= 1
  note?: string | null;
}
```

Backend behavior:

- Tenant slug must identify an active tenant.
- Tour must belong to that tenant and have `status = published`.
- Booking is inserted with `user_id = null`.
- `total_amount = Number(tour.price) * traveler_count`.
- Initial status is `pending`.

Response:

```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "uuid",
    "tenant_id": "uuid",
    "tour_id": "uuid",
    "user_id": null,
    "customer_first_name": "Ganaa",
    "customer_last_name": null,
    "customer_email": "ganaa@example.com",
    "customer_phone": "99999999",
    "traveler_count": 2,
    "total_amount": "5000000",
    "status": "pending",
    "note": "Please contact me",
    "created_at": "2026-05-01T00:00:00.000Z",
    "updated_at": "2026-05-01T00:00:00.000Z"
  }
}
```

## General Bookings

### `POST /bookings`

Public. Uses `public.find_public_bookable_tour($1::uuid)`.

If a valid bearer token is sent, the booking stores `request.authUser.userId`. If no valid token is sent, the booking stores `user_id = null`.

Request and response shapes match `POST /public/tenants/:slug/bookings`.

### `GET /bookings/my`

Auth required. Returns bookings where `bookings.user_id = current user id`.

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "tour_id": "uuid",
      "user_id": "uuid",
      "customer_first_name": "Ganaa",
      "customer_last_name": null,
      "customer_email": "ganaa@example.com",
      "customer_phone": null,
      "traveler_count": 2,
      "total_amount": "5000000",
      "status": "pending",
      "note": null,
      "created_at": "2026-05-01T00:00:00.000Z",
      "updated_at": "2026-05-01T00:00:00.000Z",
      "tour_title": "Tokyo Sakura Tour",
      "destination_country": "Japan",
      "destination_city": "Tokyo"
    }
  ]
}
```

## Tenant Dashboard

All routes require auth and controller role check:

```txt
tenant_admin
system_admin
```

Tenant-specific SQL filters use `app_current_tenant_id()`.

### `GET /tenant/dashboard/summary`

Response:

```json
{
  "data": {
    "total_tours": 12,
    "published_tours": 8,
    "draft_tours": 4,
    "total_bookings": 31,
    "pending_bookings": 5,
    "total_sales": "4200000"
  }
}
```

### `GET /tenant/tours`

Returns tenant tours.

### `GET /tenant/tours/:id`

Returns one tenant tour or `404`.

### `POST /tenant/tours`

Request validation:

```ts
{
  title: string;
  slug: string;
  description?: string;
  destination_country?: string;
  destination_city?: string;
  duration_days: number; // positive int
  capacity?: number; // nonnegative int
  price: number; // nonnegative
  currency?: string; // defaults to MNT
  start_date?: string;
  end_date?: string;
  meeting_point?: string;
  includes_text?: string;
  excludes_text?: string;
  status?: "draft" | "published" | "archived"; // defaults to draft
  is_featured?: boolean; // defaults to false
  published_to_marketplace?: boolean; // defaults to false
}
```

Response:

```json
{
  "message": "Tour created successfully",
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "title": "Tokyo Sakura Tour",
    "status": "draft"
  }
}
```

### `PATCH /tenant/tours/:id`

Partial update using the same fields as create.

Backend rule:

```txt
If published_to_marketplace is submitted as true and status is submitted, status must be published.
```

Response:

```json
{
  "message": "Tour updated successfully",
  "data": {
    "id": "uuid",
    "status": "published",
    "published_to_marketplace": true
  }
}
```

### `GET /tenant/bookings`

Returns tenant bookings with `tour_title`.

### `PATCH /tenant/bookings/:id/status`

Request:

```ts
{
  status: "pending" | "confirmed" | "paid" | "cancelled" | "completed";
  note?: string | null;
}
```

Response:

```json
{
  "message": "Booking status updated successfully",
  "booking": {
    "id": "uuid",
    "status": "confirmed",
    "note": "Confirmed by tenant admin"
  }
}
```

## System Admin

All routes require auth and `role = system_admin`.

### `GET /admin/tenants`

Returns all tenants.

### `POST /admin/tenants`

Request validation:

```ts
{
  name: string;
  slug: string;
  registration_number?: string | null;
  email?: string | null;
  phone?: string | null;
  description?: string | null;
  website_subdomain: string;
  admin_email: string;
  admin_password: string; // min length 6
  admin_first_name: string;
  admin_last_name?: string | null;
}
```

Backend creates tenant, website settings, and a `tenant_admin` user in one transaction.

### `PATCH /admin/tenants/:id/status`

Request:

```ts
{
  status: "pending" | "active" | "suspended";
}
```

## Unimplemented Endpoints

Do not call these from production frontend code until backend support exists:

```http
POST /auth/customer/register
POST /auth/customer/login
GET /customer/bookings
GET /customer/bookings/:id
```

## Common Error Responses

```json
{ "message": "Unauthorized" }
```

```json
{ "message": "Forbidden" }
```

```json
{
  "message": "Invalid request body",
  "errors": {}
}
```

Message text varies by controller, so frontend code should display `message` when present and keep a generic fallback.
