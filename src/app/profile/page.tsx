import type { Metadata } from "next";

import { ProfileClient } from "@/components/auth/ProfileClient";

export const metadata: Metadata = {
  title: "Профайл",
};

export default function ProfilePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <ProfileClient />
    </main>
  );
}
