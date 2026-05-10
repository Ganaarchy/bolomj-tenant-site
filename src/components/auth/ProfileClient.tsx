"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { getAccessToken, logout } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";

export function ProfileClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      window.location.assign("/login");
      return;
    }

    apiFetch<AuthUser>("/auth/me", { auth: true })
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : "Профайл ачаалахад алдаа гарлаа"))
      .finally(() => setLoading(false));
  }, []);

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
        {user ? (
          <dl className="grid gap-4 text-sm">
            <Row label="Нэр" value={`${user.first_name} ${user.last_name || ""}`.trim()} />
            <Row label="И-мэйл" value={user.email} />
            <Row label="Эрх" value={user.role} />
          </dl>
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
    <div className="grid gap-1 rounded-md border border-slate-200 p-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-950">{value}</dd>
    </div>
  );
}
