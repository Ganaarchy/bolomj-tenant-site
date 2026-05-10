import Link from "next/link";
import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Нэвтрэх",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <LoginForm />
      <Button asChild variant="link" className="mt-4">
        <Link href="/">Нүүр рүү буцах</Link>
      </Button>
    </main>
  );
}
