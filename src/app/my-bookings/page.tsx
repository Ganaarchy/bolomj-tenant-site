import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Миний захиалгууд түр хаалттай",
};

export default function MyBookingsPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-slate-100">
            <ClipboardX className="h-5 w-5 text-slate-600" />
          </div>
          <CardTitle>Захиалгын түүх түр хаалттай</CardTitle>
          <CardDescription>
            `/customer/bookings` endpoint одоогоор байхгүй тул customer booking history-г
            production дээр харуулахгүй.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/">Нүүр рүү буцах</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
