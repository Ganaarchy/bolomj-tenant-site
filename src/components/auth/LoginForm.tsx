"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

const loginSchema = z.object({
  email: z.string().trim().email("Зөв и-мэйл оруулна уу"),
  password: z.string().min(6, "Нууц үг 6 тэмдэгтээс багагүй байна"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setError(null);

    try {
      const response = await apiFetch<LoginResponse>("/auth/customer/login", {
        method: "POST",
        body: values,
      });

      setAuth(response.accessToken, response.user);
      router.push(returnTo || "/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Нэвтрэхэд алдаа гарлаа");
    }
  }

  return (
    <Card className="w-full max-w-md rounded-lg">
      <CardHeader>
        <CardTitle>Нэвтрэх</CardTitle>
        <CardDescription>
          Customer эрхтэй хэрэглэгчээр нэвтэрч аялал захиална.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
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
                <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
              </FormControl>
              <FormMessage>{form.formState.errors.password?.message}</FormMessage>
            </FormItem>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <LogIn className="h-4 w-4" />
              {form.formState.isSubmitting ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </Button>
          </form>
        </Form>
        <Button asChild variant="link" className="mt-4 w-full">
          <Link href={`/register${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}>
            Бүртгэл үүсгэх
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
