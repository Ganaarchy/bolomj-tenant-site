# Dashboard Frontend Specification

Project:

```txt
bolomj-dashboard
```

Domain:

```txt
https://app.bolomj.space
```

Environment:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.bolomj.space
```

## Purpose

The dashboard is the admin frontend for:

```txt
system_admin
tenant_admin
```

It is not a public customer application.

## Required Pages

| Page | Roles | Backend support |
| --- | --- | --- |
| `/login` | Public | `POST /auth/login` |
| `/dashboard` | `tenant_admin`, `system_admin` | `GET /tenant/dashboard/summary` |
| `/tours` | `tenant_admin`, `system_admin` | `GET /tenant/tours` |
| `/tours/new` | `tenant_admin`, `system_admin` | `POST /tenant/tours` |
| `/tours/[id]/edit` | `tenant_admin`, `system_admin` | `GET /tenant/tours/:id`, `PATCH /tenant/tours/:id` |
| `/bookings` | `tenant_admin`, `system_admin` | `GET /tenant/bookings`, `PATCH /tenant/bookings/:id/status` |
| `/admin/tenants` | `system_admin` | `GET`, `POST`, `PATCH /admin/tenants...` |
| `/profile` | Authenticated | `GET /auth/me` |

Do not implement a working `/settings/website` mutation page yet. The backend currently has no tenant website settings update route.

## Auth Requirements

Login response:

```ts
type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};
```

After login:

- Save `accessToken`.
- Save `user`.
- Send `Authorization: Bearer <accessToken>` for protected routes.
- Redirect `system_admin` to `/admin/tenants`.
- Redirect `tenant_admin` to `/dashboard`.

On `401`, clear auth and redirect to `/login`.

On `403`, show a forbidden state without logging out.

## Layout

Use a dashboard shell:

- Sidebar
- Top header
- Main content area
- User menu
- Role badge
- Logout action

Tenant admin sidebar:

```txt
Dashboard
Tours
Bookings
Profile
Logout
```

System admin sidebar:

```txt
Tenants
Dashboard
Tours
Bookings
Profile
Logout
```

Note: system admins can pass controller checks on tenant routes, but tenant-scoped SQL uses `app_current_tenant_id()`. If the logged-in system admin has `tenant_id = null`, tenant dashboards, tours, and bookings may be empty.

## Dashboard Summary

Endpoint:

```http
GET /tenant/dashboard/summary
```

Cards:

- Total tours
- Published tours
- Draft tours
- Total bookings
- Pending bookings
- Total sales

`total_sales` may arrive as a string because PostgreSQL `numeric` is returned by `pg` as text.

## Tours

List endpoint:

```http
GET /tenant/tours
```

Create endpoint:

```http
POST /tenant/tours
```

Update endpoint:

```http
PATCH /tenant/tours/:id
```

Tour form fields:

- `title` required
- `slug` required
- `description`
- `destination_country`
- `destination_city`
- `duration_days` required positive integer
- `capacity` optional nonnegative integer
- `price` required nonnegative number
- `currency`, default `MNT`
- `start_date`
- `end_date`
- `meeting_point`
- `includes_text`
- `excludes_text`
- `status`: `draft | published | archived`
- `is_featured`
- `published_to_marketplace`

Frontend validation should mirror the backend rule:

```txt
published_to_marketplace can be true only when status is published.
```

Tour list should support:

- Search by title.
- Status filter.
- Marketplace publication filter.
- Create action.
- Edit action.
- Publish/archive convenience actions using `PATCH`.

## Bookings

List endpoint:

```http
GET /tenant/bookings
```

Status update endpoint:

```http
PATCH /tenant/bookings/:id/status
```

Booking statuses:

```txt
pending
confirmed
paid
cancelled
completed
```

Booking list should show:

- Customer name
- Email
- Phone
- Tour title
- Traveler count
- Total amount
- Status
- Created date
- Note

Status update form:

```ts
{
  status: BookingStatus;
  note?: string | null;
}
```

The response is `{ message, booking }`, not `{ data }`.

## System Admin Tenants

Endpoints:

```http
GET /admin/tenants
POST /admin/tenants
PATCH /admin/tenants/:id/status
```

Create tenant form fields:

- `name`
- `slug`
- `registration_number`
- `email`
- `phone`
- `description`
- `website_subdomain`
- `admin_email`
- `admin_password`
- `admin_first_name`
- `admin_last_name`

Tenant status values:

```txt
pending
active
suspended
```

Creating a tenant also creates:

- tenant website settings
- initial `tenant_admin` user

## Profile

Endpoint:

```http
GET /auth/me
```

Display:

- Name
- Email
- Role
- Tenant id when present

The response is a direct user object.

## API Client Requirements

Implement a shared client that:

- Uses `NEXT_PUBLIC_API_BASE_URL`.
- Removes trailing slash from base URL.
- Adds `Accept: application/json`.
- Adds `Content-Type: application/json` when body exists.
- Adds bearer token when available.
- Parses JSON safely.
- Supports `{ data }`, direct objects, and `{ message, booking }`.
- Throws readable errors with status and message.

## Blocked or Not Supported

- Website settings update route is not implemented.
- Tour images, categories, reviews, and favorites have no dashboard API.
- Public customer registration/login is not implemented.

## Acceptance Checklist

- Login works for `system_admin` and `tenant_admin`.
- `accessToken` is stored and sent.
- 401 and 403 are handled differently.
- Tenant admin can create and update tours.
- Tenant admin can manage booking status.
- System admin can create tenants and update tenant status.
- No frontend sends `tenant_id` for tenant dashboard operations.
- Build passes.
