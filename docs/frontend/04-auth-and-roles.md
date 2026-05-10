# Auth, Roles, and RLS

## JWT Flow

Login endpoint:

```http
POST /auth/login
```

The login response field is `accessToken`.

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

Frontend projects must store and send:

```http
Authorization: Bearer <accessToken>
```

Do not use `token`, `access_token`, or `jwt` as the primary login response field.

## Implemented Roles

Live database enum `user_role` contains:

```txt
system_admin
tenant_admin
user
```

The backend also uses unauthenticated runtime context:

```txt
guest
```

The old frontend docs used `customer`. That role is not present in the inspected database enum and no customer auth endpoints exist in the current source. For current frontend work, use `user` when typing an authenticated public user. Use `guest` only as a frontend/runtime concept for unauthenticated visitors.

## Backend Request Context

The backend has two auth paths:

1. Global `onRequest` hook tries to read a bearer token. If valid, it sets `request.authUser`.
2. Protected routes use `app.authenticate`, which rejects invalid/missing JWTs with `401`.

Before handlers run, the backend opens a Postgres client and sets:

```sql
SELECT set_config('app.user_id', $1, false);
SELECT set_config('app.role', $1, false);
SELECT set_config('app.tenant_id', $1, false);
```

Authenticated values come from JWT payload:

```txt
sub
role
tenant_id
```

Guest defaults:

```txt
app.user_id = ''
app.role = 'guest'
app.tenant_id = ''
```

Frontend code never sets these values directly.

## Role Capabilities

### guest

No JWT token.

Can:

- Browse marketplace tours.
- Browse active tenant public websites.
- Browse active tenant published tours.
- Create current public bookings, which are stored with `user_id = null`.

Cannot:

- Access dashboard routes.
- Access `/bookings/my`.
- Manage tours, bookings, or tenants.

### user

JWT-backed public user role if such users exist in the database.

Can:

- Call `GET /auth/me`.
- Call `GET /bookings/my`.
- Create a booking through `POST /bookings`; the booking stores the current user id.

Current limitations:

- No public registration endpoint exists.
- No public customer login endpoint exists separate from `POST /auth/login`.
- No `/customer/bookings` endpoints exist.

### tenant_admin

JWT-backed tenant operator.

Can:

- Access dashboard routes.
- View tenant summary.
- Create, read, and update own tenant tours.
- View own tenant bookings.
- Update own tenant booking statuses.

Frontend rule:

```txt
Never send tenant_id in tenant dashboard requests.
```

The backend reads tenant id from JWT and SQL uses `app_current_tenant_id()`.

### system_admin

JWT-backed platform operator.

Can:

- List all tenants.
- Create tenants.
- Update tenant status.
- Access dashboard tenant routes at controller level.

Important implementation note:

Some tenant dashboard service queries still filter by `app_current_tenant_id()`. A `system_admin` has `tenant_id = null`, so pages using `/tenant/tours`, `/tenant/bookings`, or `/tenant/dashboard/summary` may return empty tenant-scoped data unless backend behavior changes.

## Protected Route Behavior

Routes with `app.authenticate` return:

```http
401 Unauthorized
```

when the JWT is missing or invalid.

Controller role checks return:

```http
403 Forbidden
```

when the user is authenticated but does not have the required role.

Frontend behavior:

- On `401`, clear token and stored user, then redirect to login.
- On `403`, keep the user logged in and show a forbidden state.

## RLS Behavior

Live metadata confirmed RLS is enabled and forced on:

```txt
users
tenants
tenant_websites
tours
bookings
```

Relevant policy behavior:

- `tours`: tenant admins can access rows for `app_current_tenant_id()`, system admins can access all, guests can select published tours.
- `bookings`: tenant admins can select/update rows for their tenant, system admins can access all, authenticated users can select their own `user_id` bookings, guests can insert bookings with `user_id IS NULL`.
- `tenants`: system admins can access all; tenant-scoped access uses current tenant; guest active-tenant select policy exists.
- `tenant_websites`: system admins or matching tenant context can select/update.
- `users`: system admins, the current user, or tenant admins for matching tenant can select/update.

Frontend UI should hide impossible actions, but security must be assumed to live in the backend and database.

## Storage Keys

Recommended localStorage keys:

```txt
bolomj_access_token
bolomj_user
```

Dashboard can redirect by role:

```ts
export function dashboardHomeForRole(role: string) {
  if (role === "system_admin") return "/admin/tenants";
  if (role === "tenant_admin") return "/dashboard";
  return "/login";
}
```

Marketplace and tenant-site frontends should not promise public customer login/register until backend endpoints exist.
