"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { getAccessToken, getStoredUser } from "@/lib/auth";
import type { BookingCreateResponse, TenantPublicTour } from "@/lib/types";

const bookingSchema = z.object({
  customer_first_name: z.string().trim().min(1, "Нэрээ оруулна уу"),
  customer_last_name: z.string().trim().optional(),
  customer_email: z.string().trim().email("Зөв и-мэйл оруулна уу"),
  customer_phone: z.string().trim().optional(),
  traveler_count: z.coerce.number().int().min(1, "Аялагчдын тоо 1-ээс багагүй байна"),
  note: z.string().trim().optional(),
});

type BookingFormInput = z.input<typeof bookingSchema>;
type BookingFormValues = z.output<typeof bookingSchema>;

export function BookingForm({ tenantSlug, tour }: { tenantSlug: string; tour: TenantPublicTour }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<BookingFormInput, unknown, BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customer_first_name: "",
      customer_last_name: "",
      customer_email: "",
      customer_phone: "",
      traveler_count: 1,
      note: "",
    },
  });

  async function onSubmit(values: BookingFormValues) {
    setError(null);
    const storedUser = getStoredUser();
    const customerAccessToken = storedUser?.role === "customer" ? getAccessToken() : null;

    try {
      const response = await apiFetch<BookingCreateResponse>(`/public/tenants/${tenantSlug}/bookings`, {
        method: "POST",
        accessToken: customerAccessToken,
        body: {
          tour_id: tour.id,
          customer_first_name: values.customer_first_name,
          customer_last_name: values.customer_last_name || null,
          customer_email: values.customer_email,
          customer_phone: values.customer_phone || null,
          traveler_count: values.traveler_count,
          note: values.note || null,
        },
      });

      const bookingId = response.booking?.id;
      if (!bookingId) {
        throw new Error(response.message || "Захиалга үүссэн эсэхийг баталгаажуулж чадсангүй");
      }

      const params = new URLSearchParams({ tenant: tenantSlug });
      params.set("booking", bookingId);
      router.push(`/booking-success?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Захиалга үүсгэхэд алдаа гарлаа");
    }
  }

  return (
    <Card className="rounded-lg border-slate-200">
      <CardHeader>
        <CardTitle className="text-2xl">Захиалга илгээх</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

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

            <FormItem>
              <FormLabel htmlFor="customer_email">И-мэйл</FormLabel>
              <FormControl>
                <Input id="customer_email" type="email" autoComplete="email" {...form.register("customer_email")} />
              </FormControl>
              <FormMessage>{form.formState.errors.customer_email?.message}</FormMessage>
            </FormItem>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormItem>
                <FormLabel htmlFor="customer_phone">Утас</FormLabel>
                <FormControl>
                  <Input id="customer_phone" autoComplete="tel" {...form.register("customer_phone")} />
                </FormControl>
                <FormMessage>{form.formState.errors.customer_phone?.message}</FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel htmlFor="traveler_count">Аялагчдын тоо</FormLabel>
                <FormControl>
                  <Input
                    id="traveler_count"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    {...form.register("traveler_count")}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.traveler_count?.message}</FormMessage>
              </FormItem>
            </div>

            <FormItem>
              <FormLabel htmlFor="note">Тайлбар</FormLabel>
              <FormControl>
                <Textarea id="note" placeholder="Нэмэлт хүсэлт байвал бичнэ үү" {...form.register("note")} />
              </FormControl>
              <FormMessage>{form.formState.errors.note?.message}</FormMessage>
            </FormItem>

            <Button className="w-full" size="lg" type="submit" disabled={form.formState.isSubmitting}>
              <Send className="h-4 w-4" />
              {form.formState.isSubmitting ? "Илгээж байна..." : "Захиалга илгээх"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
