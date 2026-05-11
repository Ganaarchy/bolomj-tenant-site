export type ApiDataResponse<T> = {
  data: T;
};

export type ApiMessageResponse = {
  message: string;
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: unknown;
};

export type ApiResponse<T> = T | ApiDataResponse<T>;

export type UserRole = "guest" | "customer" | "system_admin" | "tenant_admin";

export type TourStatus = "draft" | "published" | "archived";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "paid"
  | "cancelled"
  | "completed";

export type TenantStatus = "pending" | "active" | "suspended";

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
  created_at?: string;
  updated_at?: string;
  website: PublicTenantWebsite;
};

export type TenantPublicTour = {
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
  cover_image_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

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

export type BookingStatusUpdateResponse = {
  message: string;
  booking: Booking;
};

export type UpdateBookingStatusPayload = {
  status: BookingStatus;
  note?: string | null;
};

export type MyBooking = Booking & {
  tour_title: string;
  destination_country: string | null;
  destination_city: string | null;
};

export const STORAGE_KEYS = {
  accessToken: "bolomj_access_token",
  user: "bolomj_user",
} as const;

export const RESERVED_SUBDOMAINS = [
  "app",
  "api",
  "www",
  "bolomj",
  "localhost",
] as const;

export const CUSTOMER_ENDPOINTS_PENDING_VERIFICATION = [
  "POST /auth/customer/register",
  "POST /auth/customer/login",
  "GET /customer/bookings",
  "GET /customer/bookings/:id",
] as const;

export type CustomerEndpointPendingVerification = (typeof CUSTOMER_ENDPOINTS_PENDING_VERIFICATION)[number];

export type CustomerRegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name?: string | null;
};

export type CustomerLoginPayload = LoginPayload;
export type CustomerBookingDetail = MyBooking;
