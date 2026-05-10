# Bolomj Frontend Product Goal

This directory is the frontend contract for the current Bolomj backend. It is based on the Fastify routes, Zod schemas, service SQL, JWT hooks, and live PostgreSQL metadata inspected from the backend project.

## System Shape

Bolomj is a multi-tenant travel platform with three separate frontend projects:

| Project | Production domain | Purpose |
| --- | --- | --- |
| `bolomj-dashboard` | `https://app.bolomj.space` | Admin dashboard for platform and tenant operators. |
| `bolomj-marketplace` | `https://bolomj.space` | Public marketplace showing published marketplace tours. |
| `bolomj-tenant-site` | `https://{tenant}.bolomj.space` | Dynamic public website for one tenant, resolved by subdomain. |

Backend API:

```txt
https://api.bolomj.space
```

Local frontends should use an environment variable such as:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.bolomj.space
```

## Implemented Today

- System admins can log in, list tenants, create tenants, and update tenant status.
- Tenant admins can log in, view tenant dashboard metrics, manage tours, view tenant bookings, and update booking status.
- Guests can browse marketplace tours and tenant public tours.
- Guests can create tenant-site bookings through the current public booking endpoint. These bookings are stored with `user_id = null`.
- Authenticated users can call `GET /bookings/my`, but the backend currently has no customer registration/login endpoints that create public customer accounts.

## Explicit Backend Gaps

The following endpoints are not implemented in the current backend and must not be treated as available by frontend projects:

```http
POST /auth/customer/register
POST /auth/customer/login
GET /customer/bookings
GET /customer/bookings/:id
```

If a frontend includes login, registration, or customer booking-history screens, those screens must be marked blocked or wired behind a backend feature flag until the API exists.

## Roles and Security Model

Implemented database enum roles:

```txt
system_admin
tenant_admin
user
```

Runtime guest context:

```txt
guest
```

The backend derives security context from JWT when a bearer token is present. For every request it sets PostgreSQL session values:

```txt
app.user_id
app.role
app.tenant_id
```

Frontend projects must not send `tenant_id` manually for tenant dashboard operations. Tenant isolation is enforced by backend SQL and PostgreSQL RLS.

## RLS Metadata

Live database metadata confirmed RLS is enabled and forced on frontend-relevant tables:

```txt
users
tenants
tenant_websites
tours
bookings
```

Additional tables exist, including `categories`, `tour_images`, `reviews`, `favorites`, and audit/history tables, but the current backend exposes no frontend API for them.

## Response Shape Rules

Frontend API clients must support multiple response shapes:

- Read endpoints usually return `{ data: ... }`.
- `POST /auth/login` returns `{ accessToken, user }`.
- Booking create/update endpoints return `{ message, booking }`.
- Tour, tenant, and admin mutations return `{ message, data }`.

## Implementation Principle

Each frontend project should build only against implemented API behavior. Planned customer account features can be designed visually, but they must be documented as blocked by backend work instead of faking success.
