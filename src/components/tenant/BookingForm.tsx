"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Send, Trash2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api";
import {
  AUTH_CHANGE_EVENT,
  getAccessToken,
  getStoredUser,
  loginPathWithReturnTo,
  setStoredUser,
} from "@/lib/auth";
import type { AuthUser, BookingCreateRequest, BookingCreateResponse, TenantPublicTour } from "@/lib/types";
import { cn } from "@/lib/utils";

const optionalEmailSchema = z
  .string()
  .trim()
  .refine((value) => !value || z.string().email().safeParse(value).success, "Зөв и-мэйл оруулна уу")
  .optional();

const optionalDateSchema = z
  .string()
  .trim()
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "YYYY-MM-DD хэлбэрээр оруулна уу")
  .optional();

const passengerSchema = z.object({
  full_name: z.string().trim().min(1, "Аялагчийн нэрийг оруулна уу"),
  phone: z.string().trim().optional(),
  email: optionalEmailSchema,
  passport_number: z.string().trim().optional(),
  birth_date: optionalDateSchema,
  gender: z.enum(["", "male", "female", "other"]).optional(),
  nationality: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  is_primary: z.boolean().optional(),
});

const bookingSchema = z.object({
  customer_first_name: z.string().trim().min(1, "Нэрээ оруулна уу"),
  customer_last_name: z.string().trim().optional(),
  customer_email: z.string().trim().email("Зөв и-мэйл оруулна уу"),
  customer_phone: z.string().trim().optional(),
  note: z.string().trim().optional(),
  passengers: z.array(passengerSchema).min(1, "Доод тал нь нэг аялагч нэмнэ үү"),
});

type BookingFormInput = z.input<typeof bookingSchema>;
type BookingFormValues = z.output<typeof bookingSchema>;
type PassengerFormValue = BookingFormInput["passengers"][number];
type BookingAuthState = {
  isLoading: boolean;
  accessToken: string | null;
  user: AuthUser | null;
};
type BookingAuth = {
  accessToken: string;
  user: AuthUser;
};

const CUSTOMER_BOOKING_ROLE_MESSAGE = "Аялал захиалахын тулд хэрэглэгчийн эрхээр нэвтэрнэ үү.";
const AUTH_LOADING_MESSAGE = "Нэвтрэлтийн мэдээлэл шалгаж байна. Түр хүлээгээд дахин оролдоно уу.";

const emptyPassenger = (isPrimary = false): PassengerFormValue => ({
  full_name: "",
  phone: "",
  email: "",
  passport_number: "",
  birth_date: "",
  gender: "",
  nationality: "",
  notes: "",
  is_primary: isPrimary,
});

export function BookingForm({ tenantSlug, tour }: { tenantSlug: string; tour: TenantPublicTour }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<BookingAuthState>({
    isLoading: true,
    accessToken: null,
    user: null,
  });
  const lastSyncedPrimaryRef = useRef({ full_name: "", email: "", phone: "" });
  const form = useForm<BookingFormInput, unknown, BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customer_first_name: "",
      customer_last_name: "",
      customer_email: "",
      customer_phone: "",
      note: "",
      passengers: [emptyPassenger(true)],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "passengers",
  });
  const contactFirstName = useWatch({ control: form.control, name: "customer_first_name" });
  const contactLastName = useWatch({ control: form.control, name: "customer_last_name" });
  const contactEmail = useWatch({ control: form.control, name: "customer_email" });
  const contactPhone = useWatch({ control: form.control, name: "customer_phone" });
  const passengers = useWatch({ control: form.control, name: "passengers" }) || [];
  const primaryIndex = passengers.findIndex((passenger) => passenger?.is_primary);
  const normalizedPrimaryIndex = primaryIndex >= 0 ? primaryIndex : 0;

  useEffect(() => {
    let cancelled = false;

    async function loadAuthState() {
      const accessToken = getAccessToken();
      const storedUser = getStoredUser();

      if (!accessToken) {
        if (!cancelled) {
          setAuthState({ isLoading: false, accessToken: null, user: null });
        }
        return;
      }

      if (storedUser) {
        if (!cancelled) {
          setAuthState({ isLoading: false, accessToken, user: storedUser });
        }
        return;
      }

      if (!cancelled) {
        setAuthState({ isLoading: true, accessToken, user: null });
      }

      try {
        const profile = await apiFetch<AuthUser>("/auth/me", { accessToken });
        if (cancelled) return;
        setStoredUser(profile);
        setAuthState({ isLoading: false, accessToken, user: profile });
      } catch (err) {
        if (cancelled) return;
        setAuthState({ isLoading: false, accessToken, user: null });
        if (!(err instanceof ApiError) || err.status !== 401) {
          setError(err instanceof Error ? err.message : "Нэвтрэлтийн мэдээлэл шалгахад алдаа гарлаа.");
        }
      }
    }

    void loadAuthState();
    window.addEventListener("storage", loadAuthState);
    window.addEventListener(AUTH_CHANGE_EVENT, loadAuthState);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", loadAuthState);
      window.removeEventListener(AUTH_CHANGE_EVENT, loadAuthState);
    };
  }, []);

  useEffect(() => {
    const storedUser = authState.user;
    if (!isCustomerBookingRole(storedUser)) return;

    if (!form.getValues("customer_first_name")) {
      form.setValue("customer_first_name", storedUser.first_name, { shouldDirty: false });
    }

    if (!form.getValues("customer_last_name") && storedUser.last_name) {
      form.setValue("customer_last_name", storedUser.last_name, { shouldDirty: false });
    }

    if (!form.getValues("customer_email")) {
      form.setValue("customer_email", storedUser.email, { shouldDirty: false });
    }
  }, [authState.user, form]);

  useEffect(() => {
    const firstPassenger = form.getValues("passengers.0");
    if (!firstPassenger) return;

    const fullName = [contactFirstName, contactLastName].filter(Boolean).join(" ").trim();
    if (!fullName && !contactEmail && !contactPhone) return;
    const lastSynced = lastSyncedPrimaryRef.current;
    const canSyncFullName = !firstPassenger.full_name || firstPassenger.full_name === lastSynced.full_name;
    const canSyncEmail = !firstPassenger.email || firstPassenger.email === lastSynced.email;
    const canSyncPhone = !firstPassenger.phone || firstPassenger.phone === lastSynced.phone;

    if (canSyncFullName) {
      form.setValue("passengers.0.full_name", fullName, { shouldDirty: false, shouldValidate: true });
    }
    if (canSyncEmail) {
      form.setValue("passengers.0.email", contactEmail || "", { shouldDirty: false, shouldValidate: true });
    }
    if (canSyncPhone) {
      form.setValue("passengers.0.phone", contactPhone || "", { shouldDirty: false, shouldValidate: true });
    }
    form.setValue("passengers.0.is_primary", true, { shouldDirty: false });
    lastSyncedPrimaryRef.current = {
      full_name: canSyncFullName ? fullName : lastSynced.full_name,
      email: canSyncEmail ? contactEmail || "" : lastSynced.email,
      phone: canSyncPhone ? contactPhone || "" : lastSynced.phone,
    };
  }, [contactEmail, contactFirstName, contactLastName, contactPhone, form]);

  function addPassenger() {
    append(emptyPassenger(fields.length === 0));
  }

  function removePassenger(index: number) {
    if (fields.length <= 1) {
      form.setError("passengers", { message: "Доод тал нь нэг аялагч шаардлагатай" });
      return;
    }

    const removedPrimary = form.getValues(`passengers.${index}.is_primary`);
    remove(index);

    if (removedPrimary) {
      window.setTimeout(() => {
        setPrimaryPassenger(0);
      }, 0);
    }
  }

  function setPrimaryPassenger(index: number) {
    form.getValues("passengers").forEach((_, passengerIndex) => {
      form.setValue(`passengers.${passengerIndex}.is_primary`, passengerIndex === index, {
        shouldDirty: true,
      });
    });
  }

  function requireBookingAuth(): BookingAuth | null {
    if (authState.isLoading) {
      setError(AUTH_LOADING_MESSAGE);
      return null;
    }

    if (!authState.accessToken || !authState.user) {
      router.push(loginPathWithReturnTo());
      return null;
    }

    if (!isCustomerBookingRole(authState.user)) {
      setError(CUSTOMER_BOOKING_ROLE_MESSAGE);
      return null;
    }

    return {
      accessToken: authState.accessToken,
      user: authState.user,
    };
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    const bookingAuth = requireBookingAuth();
    if (!bookingAuth) {
      event.preventDefault();
      return;
    }

    void form.handleSubmit((values) => onSubmit(values, bookingAuth))(event);
  }

  async function onSubmit(values: BookingFormValues, bookingAuth: BookingAuth) {
    setError(null);
    const passengersPayload = values.passengers.map((passenger, index) => ({
      full_name: passenger.full_name,
      phone: emptyToNull(passenger.phone),
      email: emptyToNull(passenger.email),
      passport_number: emptyToNull(passenger.passport_number),
      birth_date: emptyToNull(passenger.birth_date),
      gender: passenger.gender ? passenger.gender : null,
      nationality: emptyToNull(passenger.nationality),
      notes: emptyToNull(passenger.notes),
      is_primary: index === normalizedPrimaryIndex,
    }));

    const payload: BookingCreateRequest = {
      tour_id: tour.id,
      customer_first_name: values.customer_first_name,
      customer_last_name: values.customer_last_name || null,
      customer_email: values.customer_email,
      customer_phone: values.customer_phone || null,
      traveler_count: passengersPayload.length,
      note: values.note || null,
      passengers: passengersPayload,
    };

    try {
      const response = await createBooking(tenantSlug, payload, bookingAuth.accessToken);

      const bookingId = response.booking?.id;
      if (!bookingId) {
        throw new Error(response.message || "Захиалга үүссэн эсэхийг баталгаажуулж чадсангүй");
      }

      const params = new URLSearchParams({ tenant: tenantSlug });
      params.set("booking", bookingId);
      router.push(`/booking-success?${params.toString()}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(loginPathWithReturnTo());
        return;
      }

      setError(bookingErrorMessage(err));
    }
  }

  const hasUnsupportedRole = Boolean(authState.user && !isCustomerBookingRole(authState.user));

  return (
    <Card className="rounded-lg border-slate-200">
      <CardHeader>
        <CardTitle className="text-2xl">Захиалга илгээх</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={handleFormSubmit} noValidate>
            {authState.isLoading ? (
              <Alert>
                <AlertDescription>Нэвтрэлтийн төлөв шалгаж байна...</AlertDescription>
              </Alert>
            ) : null}

            {hasUnsupportedRole ? (
              <Alert variant="destructive">
                <AlertDescription>{CUSTOMER_BOOKING_ROLE_MESSAGE}</AlertDescription>
              </Alert>
            ) : null}

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Холбоо барих мэдээлэл</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Захиалгын баталгаажуулалт энэ мэдээллээр илгээгдэнэ.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormItem>
                  <FormLabel htmlFor="customer_first_name">Нэр</FormLabel>
                  <FormControl>
                    <Input id="customer_first_name" autoComplete="given-name" {...form.register("customer_first_name")} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.customer_first_name?.message}</FormMessage>
                </FormItem>

                <FormItem>
                  <FormLabel htmlFor="customer_last_name">Овог</FormLabel>
                  <FormControl>
                    <Input id="customer_last_name" autoComplete="family-name" {...form.register("customer_last_name")} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.customer_last_name?.message}</FormMessage>
                </FormItem>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormItem>
                  <FormLabel htmlFor="customer_email">И-мэйл</FormLabel>
                  <FormControl>
                    <Input id="customer_email" type="email" autoComplete="email" {...form.register("customer_email")} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.customer_email?.message}</FormMessage>
                </FormItem>

                <FormItem>
                  <FormLabel htmlFor="customer_phone">Утас</FormLabel>
                  <FormControl>
                    <Input id="customer_phone" autoComplete="tel" {...form.register("customer_phone")} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.customer_phone?.message}</FormMessage>
                </FormItem>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Аялагчид</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {fields.length} аялагч бүртгэгдсэн. Нэг аялагч үндсэн зорчигч байна.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPassenger}>
                  <Plus className="h-4 w-4" />
                  Аялагч нэмэх
                </Button>
              </div>

              <FormMessage>{form.formState.errors.passengers?.message}</FormMessage>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Аялагч {index + 1}</p>
                        {index === normalizedPrimaryIndex ? (
                          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--tenant-primary)]">
                            <UserCheck className="h-3.5 w-3.5" />
                            Үндсэн зорчигч
                          </p>
                        ) : null}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={index === normalizedPrimaryIndex ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPrimaryPassenger(index)}
                        >
                          Үндсэн
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 text-red-600 hover:text-red-700"
                          onClick={() => removePassenger(index)}
                          disabled={fields.length <= 1}
                          aria-label="Аялагч устгах"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormItem>
                        <FormLabel htmlFor={`passengers.${index}.full_name`}>Бүтэн нэр</FormLabel>
                        <FormControl>
                          <Input
                            id={`passengers.${index}.full_name`}
                            autoComplete={index === 0 ? "name" : "off"}
                            {...form.register(`passengers.${index}.full_name`)}
                          />
                        </FormControl>
                        <FormMessage>{form.formState.errors.passengers?.[index]?.full_name?.message}</FormMessage>
                      </FormItem>

                      <FormItem>
                        <FormLabel htmlFor={`passengers.${index}.passport_number`}>Паспортын дугаар</FormLabel>
                        <FormControl>
                          <Input
                            id={`passengers.${index}.passport_number`}
                            autoComplete="off"
                            {...form.register(`passengers.${index}.passport_number`)}
                          />
                        </FormControl>
                        <FormMessage>{form.formState.errors.passengers?.[index]?.passport_number?.message}</FormMessage>
                      </FormItem>

                      <FormItem>
                        <FormLabel htmlFor={`passengers.${index}.phone`}>Утас</FormLabel>
                        <FormControl>
                          <Input
                            id={`passengers.${index}.phone`}
                            autoComplete={index === 0 ? "tel" : "off"}
                            {...form.register(`passengers.${index}.phone`)}
                          />
                        </FormControl>
                        <FormMessage>{form.formState.errors.passengers?.[index]?.phone?.message}</FormMessage>
                      </FormItem>

                      <FormItem>
                        <FormLabel htmlFor={`passengers.${index}.email`}>И-мэйл</FormLabel>
                        <FormControl>
                          <Input
                            id={`passengers.${index}.email`}
                            type="email"
                            autoComplete={index === 0 ? "email" : "off"}
                            {...form.register(`passengers.${index}.email`)}
                          />
                        </FormControl>
                        <FormMessage>{form.formState.errors.passengers?.[index]?.email?.message}</FormMessage>
                      </FormItem>

                      <FormItem>
                        <FormLabel htmlFor={`passengers.${index}.birth_date`}>Төрсөн огноо</FormLabel>
                        <FormControl>
                          <Input
                            id={`passengers.${index}.birth_date`}
                            type="date"
                            {...form.register(`passengers.${index}.birth_date`)}
                          />
                        </FormControl>
                        <FormMessage>{form.formState.errors.passengers?.[index]?.birth_date?.message}</FormMessage>
                      </FormItem>

                      <FormItem>
                        <FormLabel htmlFor={`passengers.${index}.gender`}>Хүйс</FormLabel>
                        <FormControl>
                          <select
                            id={`passengers.${index}.gender`}
                            className={cn(
                              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            )}
                            {...form.register(`passengers.${index}.gender`)}
                          >
                            <option value="">Сонгохгүй</option>
                            <option value="male">Эрэгтэй</option>
                            <option value="female">Эмэгтэй</option>
                            <option value="other">Бусад</option>
                          </select>
                        </FormControl>
                        <FormMessage>{form.formState.errors.passengers?.[index]?.gender?.message}</FormMessage>
                      </FormItem>

                      <FormItem className="sm:col-span-2">
                        <FormLabel htmlFor={`passengers.${index}.nationality`}>Иргэншил</FormLabel>
                        <FormControl>
                          <Input
                            id={`passengers.${index}.nationality`}
                            placeholder="Mongolia"
                            autoComplete="country-name"
                            {...form.register(`passengers.${index}.nationality`)}
                          />
                        </FormControl>
                        <FormMessage>{form.formState.errors.passengers?.[index]?.nationality?.message}</FormMessage>
                      </FormItem>

                      <FormItem className="sm:col-span-2">
                        <FormLabel htmlFor={`passengers.${index}.notes`}>Аялагчийн тэмдэглэл</FormLabel>
                        <FormControl>
                          <Textarea
                            id={`passengers.${index}.notes`}
                            placeholder="Хоолны дэглэм, тусгай хүсэлт гэх мэт"
                            {...form.register(`passengers.${index}.notes`)}
                          />
                        </FormControl>
                        <FormMessage>{form.formState.errors.passengers?.[index]?.notes?.message}</FormMessage>
                      </FormItem>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <FormItem>
              <FormLabel htmlFor="note">Тайлбар</FormLabel>
              <FormControl>
                <Textarea id="note" placeholder="Нэмэлт хүсэлт байвал бичнэ үү" {...form.register("note")} />
              </FormControl>
              <FormMessage>{form.formState.errors.note?.message}</FormMessage>
            </FormItem>

            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={form.formState.isSubmitting || authState.isLoading || hasUnsupportedRole}
            >
              <Send className="h-4 w-4" />
              {form.formState.isSubmitting ? "Илгээж байна..." : "Захиалга илгээх"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

async function createBooking(
  tenantSlug: string,
  payload: BookingCreateRequest,
  accessToken: string,
) {
  try {
    return await apiFetch<BookingCreateResponse>(`/public/tenants/${tenantSlug}/bookings`, {
      method: "POST",
      accessToken,
      body: payload,
    });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 404) {
      throw err;
    }

    // Live tenant-scoped booking can return a false 404 when customer auth/RLS hides public tour rows.
    // The legacy create route still uses the authenticated customer token and derives tenant_id from tour_id.
    return apiFetch<BookingCreateResponse>("/bookings", {
      method: "POST",
      accessToken,
      body: payload,
    });
  }
}

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function isCustomerBookingRole(user: AuthUser | null): user is AuthUser {
  // Customer accounts are global and have tenant_id = null. Tenant site booking checks customer role, not tenant_id.
  return user?.role === "customer" || user?.role === "user";
}

function bookingErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    if (err.status === 403) return CUSTOMER_BOOKING_ROLE_MESSAGE;
    if (err.status === 500) return err.message || "Backend алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.";
  }

  const message = err instanceof Error ? err.message : "";
  if (message.toLowerCase().includes("row-level security")) {
    return "Захиалга үүсгэхийг backend-ийн RLS policy хааж байна. Түр хүлээгээд дахин оролдоно уу эсвэл байгууллагатай холбогдоно уу.";
  }

  return message || "Захиалга үүсгэхэд алдаа гарлаа";
}
