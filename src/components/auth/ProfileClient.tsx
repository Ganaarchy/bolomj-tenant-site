"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { getAccessToken, logout, setStoredUser } from "@/lib/auth";
import type { AuthUser, UpdateProfilePayload, UpdateProfileResponse } from "@/lib/types";

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "Нэрээ оруулна уу"),
  last_name: z.string().trim().optional(),
  email: z.string().trim().email("Зөв и-мэйл оруулна уу"),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
    },
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      window.location.assign("/login");
      return;
    }

    apiFetch<AuthUser>("/auth/me", { auth: true })
      .then((profile) => {
        setUser(profile);
        form.reset({
          first_name: profile.first_name,
          last_name: profile.last_name || "",
          email: profile.email,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Профайл ачаалахад алдаа гарлаа"))
      .finally(() => setLoading(false));
  }, [form]);

  async function onSubmit(values: ProfileValues) {
    setError(null);
    setSuccess(null);

    const payload: UpdateProfilePayload = {
      first_name: values.first_name,
      last_name: values.last_name || null,
      email: values.email,
    };

    try {
      const response = await apiFetch<UpdateProfileResponse>("/auth/me", {
        method: "PATCH",
        auth: true,
        body: payload,
      });
      const updatedUser = normalizeProfileResponse(response);

      setUser(updatedUser);
      setStoredUser(updatedUser);
      form.reset({
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name || "",
        email: updatedUser.email,
      });
      setSuccess("Профайл шинэчлэгдлээ.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Профайл шинэчлэхэд алдаа гарлаа");
    }
  }

  return (
    <Card className="w-full max-w-xl rounded-lg">
      <CardHeader>
        <CardTitle>Профайл</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? <p className="text-sm text-slate-600">Ачаалж байна...</p> : null}
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {success ? (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        ) : null}
        {user ? (
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
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

              <Row label="Эрх" value={user.role} />

              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                <Save className="h-4 w-4" />
                {form.formState.isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
              </Button>
            </form>
          </Form>
        ) : null}
        <Button type="button" variant="outline" onClick={() => logout("/")}>
          <LogOut className="h-4 w-4" />
          Гарах
        </Button>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border border-slate-200 p-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-950">{value}</dd>
    </div>
  );
}

function normalizeProfileResponse(response: UpdateProfileResponse) {
  return "user" in response ? response.user : response;
}
