import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "My bookings pending verification",
};

export default function MyBookingsPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-slate-100">
            <ClipboardX className="h-5 w-5 text-slate-600" />
          </div>
          <CardTitle>Booking history pending verification</CardTitle>
          <CardDescription>
            `GET /customer/bookings` exists in the contract, but customer role/RLS and live DB behavior still
            need backend verification before this tenant site enables booking history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
