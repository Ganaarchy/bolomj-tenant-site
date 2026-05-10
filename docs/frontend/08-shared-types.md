# Shared Frontend Types

These types match the current backend routes, Zod schemas, service SQL, and inspected DB metadata.

## Common API Types

```ts
export type ApiDataResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: unknown;
};

export type ApiResponse<T> = T | ApiDataResponse<T>;

export function unwrapApiResponse<T>(payload: ApiResponse<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "data" in payload
  ) {
    return (payload as ApiDataResponse<T>).data;
  }

  return payload as T;
}
```

## Roles and Statuses

```ts
export type UserRole = "guest" | "system_admin" | "tenant_admin" | "user";

export type TourStatus = "draft" | "published" | "archived";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "paid"
  | "cancelled"
  | "completed";

export type TenantStatus = "pending" | "active" | "suspended";
```

## Auth

```ts
export type AuthUser = {
  id: string;
  email: string;
  role: Exclude<UserRole, "guest">;
  tenant_id: string | null;
  first_name: string;
  last_name: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};
```

## Tours

```ts
export type Tour = {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  description: string | null;
  destination_country: string | null;
  destination_city: string | null;
  duration_days: number;
  capacity: number | null;
  price: string | number;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  meeting_point: string | null;
  includes_text: string | null;
  excludes_text: string | null;
  status: TourStatus;
  is_featured: boolean;
  published_to_marketplace: boolean;
  created_at: string;
  updated_at: string;
};

export type MarketplaceTour = Tour & {
  status: "published";
  tenant_name: string;
  tenant_slug: string;
  tenant_subdomain: string | null;
};

export type TenantPublicTour = Tour & {
  status: "published";
};

export type CreateTourPayload = {
  title: string;
  slug: string;
  description?: string;
  destination_country?: string;
  destination_city?: string;
  duration_days: number;
  capacity?: number;
  price: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  meeting_point?: string;
  includes_text?: string;
  excludes_text?: string;
  status?: TourStatus;
  is_featured?: boolean;
  published_to_marketplace?: boolean;
};

export type UpdateTourPayload = Partial<CreateTourPayload>;
```

Frontend rule:

```txt
published_to_marketplace can be true only when status is published.
```

## Bookings

```ts
export type Booking = {
  id: string;
  tenant_id: string;
  tour_id: string;
  user_id: string | null;
  customer_first_name: string;
  customer_last_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  traveler_count: number;
  total_amount: string | number;
  status: BookingStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type TenantBooking = Booking & {
  tour_title: string;
};

export type MyBooking = Booking & {
  tour_title: string;
  destination_country: string | null;
  destination_city: string | null;
};

export type CreateBookingPayload = {
  tour_id: string;
  customer_first_name: string;
  customer_last_name?: string | null;
  customer_email: string;
  customer_phone?: string | null;
  traveler_count: number;
  note?: string | null;
};

export type BookingCreateResponse = {
  message: string;
  booking: Booking;
};

export type UpdateBookingStatusPayload = {
  status: BookingStatus;
  note?: string | null;
};

export type BookingStatusUpdateResponse = {
  message: string;
  booking: Booking;
};
```

## Dashboard

```ts
export type DashboardSummary = {
  total_tours: number;
  published_tours: number;
  draft_tours: number;
  total_bookings: number;
  pending_bookings: number;
  total_sales: string | number;
};
```

## Tenants

```ts
export type PublicTenantWebsite = {
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
  status: TenantStatus;
  created_at: string;
  updated_at: string;
  website: PublicTenantWebsite;
};

export type AdminTenant = {
  id: string;
  name: string;
  slug: string;
  registration_number: string | null;
  email: string | null;
  phone: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  description: string | null;
  website_subdomain: string | null;
  marketplace_enabled: boolean;
  status: TenantStatus;
  created_at: string;
  updated_at: string;
};

export type CreateTenantPayload = {
  name: string;
  slug: string;
  registration_number?: string | null;
  email?: string | null;
  phone?: string | null;
  description?: string | null;
  website_subdomain: string;
  admin_email: string;
  admin_password: string;
  admin_first_name: string;
  admin_last_name?: string | null;
};

export type TenantStatusUpdatePayload = {
  status: TenantStatus;
};

export type CreateTenantResponse = {
  message: string;
  data: {
    tenant: AdminTenant;
    adminUser: AuthUser;
  };
};
```

## Helpers and Constants

```ts
export type AsyncState = "idle" | "loading" | "success" | "error";

export const STORAGE_KEYS = {
  accessToken: "bolomj_access_token",
  user: "bolomj_user",
  compareTours: "bolomj_compare_tours",
} as const;

export const RESERVED_SUBDOMAINS = [
  "app",
  "api",
  "www",
  "bolomj",
  "localhost",
] as const;
```

## Unavailable Types

Do not add production dependencies on these until backend endpoints exist:

```ts
// No implemented backend endpoint currently uses these as public contracts.
export type CustomerRegisterPayload = never;
export type CustomerLoginPayload = never;
export type CustomerBookingDetail = never;
```

Do not expect these fields in implemented tour responses:

```txt
category_id
short_description
duration_nights
cover_image_url
images
reviews
favorites
```
