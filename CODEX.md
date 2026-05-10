# Bolomj Tenant Site CODEX.md

## Project

You are working on the `bolomj-tenant-site` frontend.

This is the dynamic tenant public website frontend for the Bolomj multi-tenant travel SaaS platform.

Production domain pattern:

```txt
https://{tenant}.bolomj.space
```

Examples:

```txt
https://nomad.bolomj.space
https://travelgo.bolomj.space
```

Backend API:

```txt
https://api.bolomj.space
```

This is production work, not MVP.

---

# 1. Required Docs

Before coding, read these files if they exist:

```txt
docs/frontend/01-product-goal.md
docs/frontend/02-user-flows.md
docs/frontend/03-api-endpoints.md
docs/frontend/04-auth-and-roles.md
docs/frontend/07-tenant-site-frontend.md
docs/frontend/08-shared-types.md
docs/frontend/09-codex-implementation-plan.md
```

The most important tenant-site-specific file is:

```txt
docs/frontend/07-tenant-site-frontend.md
```

Use it as the primary requirement document.

If docs folder is missing, use this CODEX.md as source of truth.

---

# 2. Product Purpose

The tenant public website allows each travel agency to have its own dynamic website.

This is not a separate static website per tenant.

One Next.js app serves all tenant websites by resolving the tenant from the subdomain.

Example:

```txt
nomad.bolomj.space → tenant slug = nomad
```

The website shows:

```txt
- tenant branding
- logo
- banner
- hero title/subtitle
- about text
- contact information
- tenant published tours
- tour detail
- customer login/register
- authenticated booking form
- customer booking history
```

---

# 3. Tenant Resolution

Frontend must read current host.

Example:

```txt
nomad.bolomj.space
```

Tenant slug:

```txt
nomad
```

Reserved subdomains must not be treated as tenants:

```txt
app
api
www
bolomj
localhost
```

Examples:

```txt
app.bolomj.space      → dashboard, not tenant
api.bolomj.space      → backend, not tenant
www.bolomj.space      → marketplace, not tenant
nomad.bolomj.space    → tenant slug = nomad
```

For local development, support query param:

```txt
http://localhost:3000?tenant=nomad
```

Create helper:

```txt
src/lib/tenant.ts
```

Required functions:

```ts
resolveTenantSlug(host, searchParams)
isReservedSubdomain(subdomain)
getTenantHomeUrl(slug)
getTenantTourUrl(slug, tourSlug)
```

---

# 4. Backend API

Base URL must come from:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.bolomj.space
NEXT_PUBLIC_ROOT_DOMAIN=bolomj.space
```

Do not hardcode localhost.

## Public tenant endpoints

```http
GET /public/tenants/by-slug/:slug
GET /public/tenants/:slug/tours
GET /public/tenants/:slug/tours/:tourSlug
```

## Booking endpoint

Production booking requires customer auth:

```http
POST /public/tenants/:slug/bookings
```

Header:

```http
Authorization: Bearer <accessToken>
```

## Customer auth endpoints

These may depend on backend readiness:

```http
POST /auth/customer/login
POST /auth/customer/register
GET /auth/me
GET /customer/bookings
GET /customer/bookings/:id
```

If customer endpoints are missing, create `BACKEND_GAPS.md` and do not fake successful behavior.

---

# 5. API Response Rules

Most backend endpoints return:

```json
{
  "data": {}
}
```

or:

```json
{
  "data": []
}
```

Auth endpoints return direct object:

```json
{
  "accessToken": "...",
  "user": {}
}
```

Frontend API client must:

```txt
- use NEXT_PUBLIC_API_BASE_URL
- remove trailing slash from base URL
- send Accept: application/json
- add Content-Type: application/json when body exists
- add Authorization: Bearer <accessToken> when token exists
- parse JSON safely
- unwrap { data }
- throw readable errors
- handle 401 by clearing auth and redirecting to login
```

Important:

```txt
Use accessToken, not only token, access_token, or jwt.
```

---

# 6. Data Types

## PublicTenant

```ts
export type PublicTenant = {
  id: string;
  name: string;
  slug: string;
  registration_number: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  website_subdomain: string | null;
  marketplace_enabled: boolean;
  status: "pending" | "active" | "suspended";
  created_at?: string;
  updated_at?: string;
  website: {
    id: string | null;
    site_title: string | null;
    hero_title: string | null;
    hero_subtitle: string | null;
    about_text: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    address: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    whatsapp_url: string | null;
  };
};
```

## TenantTour

```ts
export type TenantTour = {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  description: string | null;
  destination_country: string | null;
  destination_city: string | null;
  duration_days: number | null;
  capacity: number | null;
  price: string | number;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  meeting_point: string | null;
  includes_text: string | null;
  excludes_text: string | null;
  status: "published";
  is_featured: boolean;
  published_to_marketplace: boolean;
  cover_image_url: string | null;
  created_at?: string;
  updated_at?: string;
};
```

---

# 7. Pages

## `/`

Tenant home page.

Must load:

```http
GET /public/tenants/by-slug/:slug
GET /public/tenants/:slug/tours
```

Show:

```txt
- tenant logo
- tenant banner
- hero title
- hero subtitle
- about text
- contact info
- published tours grid
```

Use fallbacks:

```txt
hero_title fallback → tenant.name
hero_subtitle fallback → Аяллаа хялбар сонгож захиалаарай
about_text fallback → tenant.description
banner fallback → gradient hero
logo fallback → tenant name text logo
```

Empty tours state:

```txt
Энэ байгууллага одоогоор нийтлэгдсэн аялалгүй байна.
```

Tenant not found state:

```txt
Байгууллагын вебсайт олдсонгүй.
```

---

## `/tours/[tourSlug]`

Tenant tour detail page.

Must load:

```http
GET /public/tenants/:slug/tours/:tourSlug
```

Show:

```txt
- cover image
- title
- description
- destination
- duration
- capacity
- price
- start/end dates
- meeting point
- includes/excludes
- booking CTA
```

Image fallback order:

```txt
tour.cover_image_url
tenant.banner_url
gradient placeholder
```

Booking behavior:

```txt
guest → show login/register prompt
customer → show booking form
```

---

## `/login`

Customer login page.

Use:

```txt
React Hook Form
Zod
shadcn/ui Form, Input, Button, Card
```

API:

```http
POST /auth/customer/login
```

If backend endpoint is missing, document in `BACKEND_GAPS.md`.

---

## `/register`

Customer registration page.

Fields:

```txt
first_name
last_name
email
phone
password
```

Use:

```txt
React Hook Form
Zod
shadcn/ui
```

API:

```http
POST /auth/customer/register
```

If backend endpoint is missing, document in `BACKEND_GAPS.md`.

---

## `/booking-success`

Show:

```txt
Захиалга амжилттай үүслээ.
Таны захиалга pending төлөвтэй бүртгэгдлээ.
Байгууллага тантай холбогдож баталгаажуулна.
```

Actions:

```txt
Миний захиалгууд харах
Нүүр рүү буцах
```

---

## `/my-bookings`

Customer booking history.

API:

```http
GET /customer/bookings
```

If backend endpoint is missing, block page safely and document in `BACKEND_GAPS.md`.

---

## `/profile`

Customer profile page.

API:

```http
GET /auth/me
```

Show:

```txt
first_name
last_name
email
role
logout
```

---

# 8. Booking Form

Booking endpoint:

```http
POST /public/tenants/:slug/bookings
```

Auth required:

```txt
customer
```

Request:

```json
{
  "tour_id": "uuid",
  "customer_first_name": "Гантулга",
  "customer_last_name": "Должин",
  "customer_email": "ganaa@example.com",
  "customer_phone": "99999999",
  "traveler_count": 2,
  "note": "Please contact me before confirmation"
}
```

Form fields:

```txt
Нэр
Овог
И-мэйл
Утас
Аялагчдын тоо
Тайлбар
```

Validation:

```txt
first name required
email required
traveler_count minimum 1
phone optional but recommended
```

After success:

```txt
redirect to /booking-success
```

Do not allow guest booking in production.

---

# 9. UI/UX Goal

Target style:

```txt
modern travel agency website
tenant-branded
clean public website
premium SaaS + travel feel
large hero section
polished tour cards
clear booking CTA
responsive mobile-first design
Mongolian UI labels
```

Visual direction:

```txt
white background
soft gray sections
blue/slate defaults
tenant primary color where available
rounded cards
subtle borders
soft shadows
good spacing
clear typography
```

Use shadcn/ui components:

```txt
Button
Card
Input
Textarea
Label
Badge
Select
Dialog
Sheet
Skeleton
Separator
Alert
Form
```

Use lucide-react icons, not emoji.

---

# 10. Image Rules

Use:

```txt
tenant.logo_url
tenant.banner_url
tour.cover_image_url
```

Do not expect:

```txt
image_url
cover_image_url unless backend returns it
category_id
short_description
duration_nights
```

Image fallback:

```txt
tour.cover_image_url → tenant.banner_url → gradient placeholder
```

Image UX requirements:

```txt
- Use meaningful alt text.
- Use object-cover.
- Reserve aspect ratio to prevent layout shift.
- Lazy load non-critical tour card images.
- Use responsive image layout.
- Do not show broken image icon.
```

---

# 11. Accessibility Requirements

```txt
- Every form input must have label.
- Icon-only buttons must have aria-label.
- Focus states must be visible.
- Text contrast must be readable.
- Do not rely on color only for status.
- Buttons must be keyboard accessible.
- Touch targets must be comfortable on mobile.
```

---

# 12. Components

Create or improve:

```txt
components/tenant/TenantHeader.tsx
components/tenant/TenantHero.tsx
components/tenant/TenantFooter.tsx
components/tenant/TourCard.tsx
components/tenant/TourGrid.tsx
components/tenant/TourDetail.tsx
components/tenant/BookingForm.tsx
components/tenant/ContactSection.tsx
components/tenant/TenantNotFound.tsx
components/tenant/EmptyState.tsx
components/tenant/ErrorState.tsx
components/tenant/LoadingState.tsx
components/auth/LoginForm.tsx
components/auth/RegisterForm.tsx
```

---

# 13. Required Helpers

Create:

```txt
src/lib/types.ts
src/lib/api.ts
src/lib/auth.ts
src/lib/tenant.ts
src/lib/format.ts
```

## `src/lib/format.ts`

Functions:

```ts
formatPrice(price, currency)
formatDate(date)
formatDuration(days)
formatDestination(country, city)
formatBookingStatus(status)
```

Fallback:

```txt
Тодорхойгүй
```

---

# 14. Header Navigation

## guest

```txt
Нүүр
Аяллууд
Нэвтрэх
Бүртгүүлэх
```

## customer

```txt
Нүүр
Аяллууд
Миний захиалгууд
Профайл
Гарах
```

Header should use:

```txt
tenant.logo_url if exists
tenant.name fallback
```

---

# 15. SEO

Home title:

```txt
{tenant.name} - Аяллын вебсайт
```

Home description:

```txt
{tenant.name}-ийн аяллууд болон захиалгын мэдээлэл.
```

Tour detail title:

```txt
{tour.title} - {tenant.name}
```

---

# 16. Vercel Deployment

Production domain:

```txt
https://*.bolomj.space
```

Environment:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.bolomj.space
NEXT_PUBLIC_ROOT_DOMAIN=bolomj.space
```

DNS:

```txt
* CNAME cname.vercel-dns.com
```

Important:

```txt
api.bolomj.space must stay pointed to DigitalOcean.
app.bolomj.space must stay dashboard.
bolomj.space and www.bolomj.space must stay marketplace.
```

---

# 17. Workflow Rules for Codex

Before coding:

```txt
1. Inspect current project.
2. Read CODEX.md and docs.
3. Identify existing files.
4. Identify backend gaps.
5. Create short implementation plan.
6. Stop until approved if in planner mode.
```

After coding:

```txt
1. Run npm run typecheck if available.
2. Run npm run build.
3. Run npm run lint if available.
4. Fix errors.
5. Summarize changed files.
```

---

# 18. Recommended Phases

## Phase 1: Foundation

```txt
types
api client
auth helper
tenant resolver
format helpers
env example
gitignore
README
CI
```

## Phase 2: Tenant home

```txt
tenant resolution
tenant profile fetch
tenant tours fetch
hero
about
tour grid
contact
footer
```

## Phase 3: Tour detail

```txt
tour detail page
image fallback
booking CTA
includes/excludes
meeting point
```

## Phase 4: Customer auth

```txt
login
register
profile
backend gap handling if needed
```

## Phase 5: Booking

```txt
booking form
booking success
my bookings
backend gap handling if needed
```

## Phase 6: Final QA

```txt
build
typecheck
mobile
accessibility
reserved subdomains
no hardcoded localhost
```

---

# 19. Final QA Checklist

Before saying complete, verify:

```txt
1. npm run build passes.
2. npm run typecheck passes if configured.
3. npm run lint passes if configured.
4. Tenant slug resolves from subdomain.
5. localhost ?tenant=nomad works.
6. Reserved subdomains are not treated as tenant.
7. Tenant homepage loads.
8. Tenant tours load.
9. Tour detail works.
10. Images show with fallback.
11. Booking requires customer auth.
12. No fake unsupported endpoints.
13. No hardcoded localhost API.
14. accessToken is used.
15. Mobile layout is usable.
16. Mongolian labels are readable.
17. No broken image placeholders.
18. No backend secrets are used on frontend.
```