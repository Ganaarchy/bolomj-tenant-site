"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import type { LoginResponse } from "@/lib/types";

const registerSchema = z.object({
  first_name: z.string().trim().min(1, "Нэрээ оруулна уу"),
  last_name: z.string().trim().optional(),
  email: z.string().trim().email("Зөв и-мэйл оруулна уу"),
  password: z.string().min(6, "Нууц үг 6 тэмдэгтээс багагүй байна"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    setError(null);

    try {
      const response = await apiFetch<LoginResponse>("/auth/customer/register", {
        method: "POST",
        body: {
          email: values.email,
          password: values.password,
          first_name: values.first_name,
          ...(values.last_name ? { last_name: values.last_name } : {}),
        },
      });

      setAuth(response.accessToken, response.user);
      router.push(returnTo || "/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Бүртгэл үүсгэхэд алдаа гарлаа");
    }
  }

  return (
    <Card className="w-full max-w-md rounded-lg">
      <CardHeader>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-slate-100">
          <UserPlus className="h-5 w-5 text-slate-600" />
        </div>
        <CardTitle>Бүртгүүлэх</CardTitle>
        <CardDescription>
          Аялал захиалах customer эрхтэй хэрэглэгчийн бүртгэл үүсгэнэ.
        </CardDescription>
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
                <FormLabel htmlFor="first_name">Нэр</FormLabel>
                <FormControl>
                  <Input id="first_name" autoComplete="given-name" {...form.register("first_name")} />
                </FormControl>
                <FormMessage>{form.formState.errors.first_name?.message}</FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel htmlFor="last_name">Овог</FormLabel>
                <FormControl>
                  <Input id="last_name" autoComplete="family-name" {...form.register("last_name")} />
                </FormControl>
                <FormMessage>{form.formState.errors.last_name?.message}</FormMessage>
              </FormItem>
            </div>

            <FormItem>
              <FormLabel htmlFor="email">И-мэйл</FormLabel>
              <FormControl>
                <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="password">Нууц үг</FormLabel>
              <FormControl>
                <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
              </FormControl>
              <FormMessage>{form.formState.errors.password?.message}</FormMessage>
            </FormItem>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <UserPlus className="h-4 w-4" />
              {form.formState.isSubmitting ? "Бүртгэж байна..." : "Бүртгүүлэх"}
            </Button>
          </form>
        </Form>

        <Button asChild variant="link" className="mt-4 w-full">
          <Link href={`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}>
            Бүртгэлтэй бол нэвтрэх
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}
