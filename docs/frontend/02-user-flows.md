# Backend-Valid User Flows

These flows describe what the current backend supports today.

## System Admin Tenant Setup

1. `system_admin` logs in with `POST /auth/login`.
2. Dashboard stores `accessToken` and user profile.
3. Dashboard sends `Authorization: Bearer <accessToken>`.
4. System admin opens `/admin/tenants`.
5. Dashboard calls `GET /admin/tenants`.
6. System admin creates a tenant with `POST /admin/tenants`.
7. Backend creates:
   - tenant row
   - tenant website row
   - initial `tenant_admin` user
8. Tenant can be activated, suspended, or moved to pending with `PATCH /admin/tenants/:id/status`.

## Tenant Admin Tour Management

1. `tenant_admin` logs in with `POST /auth/login`.
2. Dashboard calls `GET /tenant/dashboard/summary`.
3. Tenant admin lists tours with `GET /tenant/tours`.
4. Tenant admin creates a tour with `POST /tenant/tours`.
5. Tenant admin edits a tour with `PATCH /tenant/tours/:id`.
6. To publish to marketplace, the tour must have:

```txt
status = published
published_to_marketplace = true
```

The backend rejects `published_to_marketplace = true` when the submitted status is not `published`.

## Public Marketplace Browsing

1. Guest opens `https://bolomj.space`.
2. Marketplace calls `GET /public/marketplace/tours`.
3. Backend returns published marketplace tours.
4. Guest opens a tour detail with `GET /public/marketplace/tours/:id`.
5. Marketplace redirects booking intent to:

```txt
https://{tenant_subdomain || tenant_slug}.bolomj.space/tours/{tour.slug}
```

## Tenant Public Site Browsing

1. Guest opens `https://nomad.bolomj.space`.
2. Tenant site resolves slug `nomad` from the host.
3. Tenant site calls `GET /public/tenants/by-slug/nomad`.
4. Tenant site calls `GET /public/tenants/nomad/tours`.
5. Guest opens a tour detail with `GET /public/tenants/nomad/tours/:tourSlug`.

## Current Booking Flow

Current backend behavior is guest-capable:

1. Guest or authenticated user submits a booking form.
2. Tenant site calls `POST /public/tenants/:slug/bookings`.
3. Backend validates the tenant is active and the tour is published.
4. Backend inserts the booking with:

```txt
user_id = null
status = pending
total_amount = tour.price * traveler_count
```

Alternative marketplace-compatible endpoint:

```http
POST /bookings
```

If a valid bearer token is present, `POST /bookings` stores the authenticated `request.authUser.userId`. Without a token, it stores `user_id = null`.

## Tenant Booking Management

1. Tenant admin opens dashboard bookings.
2. Dashboard calls `GET /tenant/bookings`.
3. Backend filters bookings by `app_current_tenant_id()`.
4. Tenant admin updates status with `PATCH /tenant/bookings/:id/status`.
5. Allowed statuses:

```txt
pending
confirmed
paid
cancelled
completed
```

## Blocked Future Customer Flow

Public customer registration, customer login, and customer booking history are not implemented in the backend. Frontends must not depend on these endpoints until backend work adds them.
