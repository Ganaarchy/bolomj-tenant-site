"use client";

import { LogIn, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { AUTH_CHANGE_EVENT, getAccessToken, getStoredUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";

function readSignedInUser() {
  const token = getAccessToken();
  const user = getStoredUser();
  return token && user ? user : null;
}

export function TenantAuthActions() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    const syncUser = () => setUser(readSignedInUser());

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
    };
  }, []);

  if (user === undefined) {
    return <span className="contents" aria-hidden="true" />;
  }

  if (user) {
    return (
      <Button asChild variant="ghost">
        <Link href="/profile">
          <UserRound className="h-4 w-4" />
          Профайл
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button asChild variant="ghost">
        <Link href="/login">
          <LogIn className="h-4 w-4" />
          Нэвтрэх
        </Link>
      </Button>
      <Button asChild>
        <Link href="/register">
          <UserPlus className="h-4 w-4" />
          Бүртгүүлэх
        </Link>
      </Button>
    </>
  );
}
