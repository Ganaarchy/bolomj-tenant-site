# Frontend Implementation Plan

This plan is for implementing frontend projects against the current backend. It intentionally separates implemented API work from backend gaps.

## Shared Setup

For every frontend project:

- Use Next.js App Router, TypeScript, Tailwind CSS, and a consistent component system.
- Create `.env.example` with the correct API base URL.
- Create `src/lib/api.ts`, `src/lib/auth.ts`, `src/lib/types.ts`, and `src/lib/format.ts`.
- Use `accessToken` from `POST /auth/login`.
- Send `Authorization: Bearer <accessToken>` only when a token exists.
- Handle `401` by clearing auth and redirecting to login.
- Handle `403` as a forbidden state without logout.
- Support `{ data }`, direct objects, and `{ message, booking }` responses.

## Backend Gap Checklist

Do not implement these as working production features until backend routes are added:

```http
POST /auth/customer/register
POST /auth/customer/login
GET /customer/bookings
GET /customer/bookings/:id
```

Public customer accounts should map to the actual DB role strategy. The inspected enum currently contains `user`, not `customer`.

## Dashboard Project

Project:

```txt
bolomj-dashboard
```

Implement first because it creates tenants and tours.

Tasks:

1. Build dashboard auth using `POST /auth/login` and `GET /auth/me`.
2. Add role-based shell for `system_admin` and `tenant_admin`.
3. Implement `/admin/tenants` for system admin:
   - `GET /admin/tenants`
   - `POST /admin/tenants`
   - `PATCH /admin/tenants/:id/status`
4. Implement tenant dashboard summary:
   - `GET /tenant/dashboard/summary`
5. Implement tours:
   - `GET /tenant/tours`
   - `GET /tenant/tours/:id`
   - `POST /tenant/tours`
   - `PATCH /tenant/tours/:id`
6. Implement bookings:
   - `GET /tenant/bookings`
   - `PATCH /tenant/bookings/:id/status`
7. Add `/profile` using `GET /auth/me`.
8. Do not wire website settings updates because no backend route exists.

Dashboard acceptance:

- Tenant admin does not send `tenant_id`.
- Tour publish-to-marketplace rule is enforced in the form.
- Booking status updates handle `{ message, booking }`.
- System admin tenant creation displays both tenant and admin user results.
- Build passes.

## Tenant Site Project

Project:

```txt
bolomj-tenant-site
```

Implement after dashboard because it needs tenant and tour data.

Tasks:

1. Implement tenant slug resolution from wildcard subdomain.
2. Add local fallback `?tenant=slug`.
3. Build tenant homepage:
   - `GET /public/tenants/by-slug/:slug`
   - `GET /public/tenants/:slug/tours`
4. Build tour detail:
   - `GET /public/tenants/:slug/tours/:tourSlug`
5. Build public booking form:
   - `POST /public/tenants/:slug/bookings`
6. Add booking success page that uses the create response.
7. Hide or mark login/register/my-bookings as blocked until backend customer endpoints exist.
8. Optional: profile page can use `GET /auth/me` only for existing authenticated users.

Tenant site acceptance:

- Reserved subdomains are not treated as tenant slugs.
- Tenant not found and tour not found states are separate.
- Booking creates an anonymous pending booking with the implemented endpoint.
- UI does not promise customer account history.
- Build passes.

## Marketplace Project

Project:

```txt
bolomj-marketplace
```

Implement after tenant-site or in parallel once public tour contract is stable.

Tasks:

1. Build marketplace home:
   - `GET /public/marketplace/tours`
2. Build tour detail:
   - `GET /public/marketplace/tours/:id`
3. Redirect booking action to:

```txt
https://{tenant_subdomain || tenant_slug}.bolomj.space/tours/{tour.slug}
```

4. Build compare page with localStorage:
   - max 3 tours
   - no duplicates
   - remove and clear actions
5. Hide or mark customer registration/login/my-bookings as blocked until backend endpoints exist.

Marketplace acceptance:

- No unavailable customer endpoint is called.
- Compare works without backend support.
- Booking CTA opens tenant site, not the API.
- Build passes.

## API Client Contract

Required behavior:

```ts
type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};
```

Client must:

- Remove trailing slash from base URL.
- Prefix paths with the API base URL.
- JSON stringify body values.
- Add content type only when body exists.
- Parse empty responses safely.
- Unwrap `{ data }`.
- Preserve direct login and booking responses.
- Throw errors containing HTTP status and backend message.

## Formatting Helpers

Each project should implement:

```ts
formatPrice(price: string | number, currency: string): string
formatDate(value: string | null): string
formatDuration(days: number | null): string
formatDestination(country: string | null, city: string | null): string
```

Numeric fields that may arrive as strings:

```txt
price
total_amount
total_sales
```

## Verification

Before considering a frontend implementation complete:

- Search the codebase for unsupported endpoint strings.
- Build the project.
- Verify 401 and 403 behavior.
- Verify no dashboard request manually sends `tenant_id`.
- Verify all API paths use `NEXT_PUBLIC_API_BASE_URL`.
- Verify response handling supports all backend response shapes.

## Backend Work Recommended Later

To support production customer accounts, add backend routes and docs for:

- Public user registration.
- Public user login or a clearly documented shared login path.
- Customer booking history list/detail.
- Consistent role naming between frontend language and DB enum.
- Optional authenticated tenant-site booking that stores `user_id`.
