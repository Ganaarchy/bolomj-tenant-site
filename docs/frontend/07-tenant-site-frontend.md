# Tenant Site Frontend Specification

Project:

```txt
bolomj-tenant-site
```

Domain:

```txt
https://{tenant}.bolomj.space
```

Environment:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.bolomj.space
NEXT_PUBLIC_ROOT_DOMAIN=bolomj.space
```

## Purpose

One Next.js project serves all tenant public websites. The tenant is resolved from the subdomain and loaded from the backend.

Example:

```txt
https://nomad.bolomj.space -> slug nomad
```

## Implemented Backend Scope

Supported today:

- Tenant profile by slug.
- Tenant published tour list.
- Tenant published tour detail.
- Public anonymous booking creation.

Blocked by backend gaps:

- Customer self-registration.
- Customer-specific login flow.
- Customer booking history endpoints under `/customer/bookings`.

## Tenant Resolution

Reserved subdomains:

```txt
app
api
www
bolomj
localhost
```

Recommended helper:

```ts
export function resolveTenantSlug(host: string, searchParams?: URLSearchParams) {
  const hostname = host.split(":")[0] ?? host;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return searchParams?.get("tenant") || null;
  }

  const subdomain = hostname.split(".")[0];
  const reserved = ["app", "api", "www", "bolomj", "localhost"];

  if (!subdomain || reserved.includes(subdomain)) return null;
  return subdomain;
}
```

Local development URL:

```txt
http://localhost:3000?tenant=nomad
```

## Pages

| Page | Backend support |
| --- | --- |
| `/` | `GET /public/tenants/by-slug/:slug`, `GET /public/tenants/:slug/tours` |
| `/tours/[tourSlug]` | `GET /public/tenants/:slug/tours/:tourSlug` |
| `/booking-success` | Client-side confirmation page |
| `/login` | Blocked unless using generic `POST /auth/login` for existing users |
| `/register` | Blocked, no backend endpoint |
| `/my-bookings` | Blocked, no `/customer/bookings` endpoint |
| `/profile` | Available only for authenticated users through `GET /auth/me` |

## Home Page

Endpoints:

```http
GET /public/tenants/by-slug/:slug
GET /public/tenants/:slug/tours
```

Use tenant fields:

- `name`
- `logo_url`
- `banner_url`
- `description`
- `website.site_title`
- `website.hero_title`
- `website.hero_subtitle`
- `website.about_text`
- `website.contact_email`
- `website.contact_phone`
- `website.address`
- `website.primary_color`
- `website.secondary_color`
- social URLs

Fallbacks:

- Missing logo: show tenant name.
- Missing banner: use a designed placeholder background.
- Missing hero title: use tenant name.
- Missing about text: use tenant description.

## Tour List and Detail

List endpoint:

```http
GET /public/tenants/:slug/tours
```

Detail endpoint:

```http
GET /public/tenants/:slug/tours/:tourSlug
```

Backend returns only tours where:

```txt
tenant.status = active
tour.status = published
```

The tenant-site public tour list is not limited by `published_to_marketplace`.

## Booking Form

Endpoint:

```http
POST /public/tenants/:slug/bookings
```

Current auth status:

```txt
Public. No Authorization header required.
```

Request:

```ts
{
  tour_id: string;
  customer_first_name: string;
  customer_last_name?: string | null;
  customer_email: string;
  customer_phone?: string | null;
  traveler_count: number;
  note?: string | null;
}
```

Backend behavior:

- Validates active tenant.
- Validates published tour belongs to tenant.
- Inserts `user_id = null`.
- Sets `status = pending`.
- Calculates `total_amount`.

After success, redirect to `/booking-success` and optionally pass booking id in local state or query string. Do not depend on customer account history to show the booking later.

## Auth Pages

Do not present registration or customer login as implemented production behavior. Current backend only exposes:

```http
POST /auth/login
GET /auth/me
```

If `/login` is kept in the tenant site, it can only authenticate existing backend users. Self-service public registration is a backend TODO.

## Header Navigation

Guest navigation:

```txt
Home
Tours
```

Optional auth links may be shown as disabled or "coming soon" until backend customer auth exists.

Authenticated navigation, if using existing `POST /auth/login`:

```txt
Home
Tours
Profile
Logout
```

Do not show "My bookings" as implemented unless it is wired to `GET /bookings/my` for existing authenticated `user` records and the limitation is clear.

## API Client

Requirements:

- Use `NEXT_PUBLIC_API_BASE_URL`.
- Resolve tenant slug before calling tenant endpoints.
- Unwrap `{ data }` responses.
- Preserve `{ message, booking }` responses.
- Handle `404` tenant not found and tour not found distinctly.

## Visual Requirements

The tenant site should be tenant-branded:

- Apply primary and secondary colors from `tenant.website`.
- Use logo and banner when available.
- Keep tour cards readable when images are missing.
- Include contact details from tenant website settings.

## Acceptance Checklist

- Tenant slug resolves from wildcard subdomain.
- Local `?tenant=` fallback works.
- Tenant profile loads.
- Published tenant tours load.
- Tour detail loads by slug.
- Booking form creates an anonymous pending booking.
- Booking success page does not depend on customer history.
- Customer auth/register/history pages are marked blocked or hidden.
- Build passes.
