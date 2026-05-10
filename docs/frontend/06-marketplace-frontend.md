# Marketplace Frontend Specification

Project:

```txt
bolomj-marketplace
```

Domain:

```txt
https://bolomj.space
```

Environment:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.bolomj.space
NEXT_PUBLIC_SITE_URL=https://bolomj.space
```

## Purpose

The marketplace is a public travel discovery frontend. It lists tours from all tenants that are published to the marketplace.

## Implemented Backend Scope

Supported today:

- Public marketplace tour list.
- Public marketplace tour detail.
- Local compare experience.
- Redirect from marketplace tour detail to tenant public site.

Blocked by backend gaps:

- Public customer registration.
- Public customer login.
- Customer booking history pages using `/customer/bookings`.

## Pages

| Page | Backend support |
| --- | --- |
| `/` | `GET /public/marketplace/tours` |
| `/tours/[id]` | `GET /public/marketplace/tours/:id` |
| `/compare` | Client-side localStorage only |
| `/login` | Blocked unless using generic `POST /auth/login` for existing `user` accounts |
| `/register` | Blocked, no backend endpoint |
| `/my-bookings` | Blocked, no `/customer/bookings` endpoint |
| `/profile` | Available only for already-authenticated users through `GET /auth/me` |

## Tour Visibility

Marketplace endpoints return tours where:

```txt
tours.status = published
tours.published_to_marketplace = true
```

The source query joins tenants and returns:

```txt
tenant_name
tenant_slug
tenant_subdomain
```

The service SQL does not explicitly filter tenant status on marketplace routes. Frontend should not assume inactive tenants are filtered unless backend is changed.

## Home Page

Endpoint:

```http
GET /public/marketplace/tours
```

Required UI:

- Search input.
- Destination filters from loaded data.
- Tenant filter from loaded data.
- Featured filter.
- Sort by newest, price ascending, price descending.
- Tour grid.
- Compare bar.
- Loading, empty, and error states.

Tour cards should show:

- Title
- Tenant name
- Destination country/city
- Duration days
- Capacity
- Price/currency
- Featured badge
- Compare action
- Detail action
- Booking redirect action

There is no implemented image field in the marketplace tour response. Use a consistent placeholder or design treatment, not an unavailable API field.

## Tour Detail Page

Endpoint:

```http
GET /public/marketplace/tours/:id
```

Show all returned tour fields plus tenant identity.

Booking action redirects to the tenant site:

```ts
export function getTenantTourUrl(tour: MarketplaceTour) {
  const subdomain = tour.tenant_subdomain || tour.tenant_slug;
  return `https://${subdomain}.bolomj.space/tours/${tour.slug}`;
}
```

Do not attempt to book directly from the marketplace unless using the generic implemented `POST /bookings` flow by deliberate product choice.

## Compare

Compare is frontend-only.

Storage key:

```txt
bolomj_compare_tours
```

Rules:

- Maximum 3 tours.
- No duplicates.
- Remove one tour.
- Clear all tours.
- Data may become stale; provide a refresh path back to tour detail.

## Auth-Adjacent Pages

The backend has `POST /auth/login`, but no dedicated customer register/login routes. If marketplace includes `/login`, it must be documented as:

- Available only for existing backend users that can authenticate with `POST /auth/login`.
- Not a self-service registration flow.

Do not implement `/register` as a successful production flow until backend adds an endpoint.

`/my-bookings` should be hidden or blocked until a customer booking history API exists. The implemented `GET /bookings/my` requires auth and returns bookings linked to the current `user_id`, but there is no public registration flow to create those users.

## API Client

Requirements:

- Use `NEXT_PUBLIC_API_BASE_URL`.
- Add `Accept: application/json`.
- Add bearer token only when present.
- Unwrap `{ data }`.
- Preserve direct response objects when no `data` key exists.
- On `401`, clear auth state if auth is enabled.

## Type Notes

Use `MarketplaceTour` from `08-shared-types.md`.

Numeric fields from PostgreSQL may arrive as strings:

```txt
price
```

Dates arrive as strings in JSON:

```txt
start_date
end_date
created_at
updated_at
```

## Acceptance Checklist

- Home page loads marketplace tours.
- Tour detail loads by id.
- Booking CTA redirects to tenant subdomain.
- Compare works without backend support.
- No unavailable customer endpoints are called as production dependencies.
- API base URL comes from environment.
- Build passes.
