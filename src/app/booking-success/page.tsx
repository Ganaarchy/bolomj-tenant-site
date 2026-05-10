import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Захиалга амжилттай үүслээ",
};

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const tenant = Array.isArray(query.tenant) ? query.tenant[0] : query.tenant;
  const booking = Array.isArray(query.booking) ? query.booking[0] : query.booking;
  const homeHref = tenant ? `/?tenant=${tenant}` : "/";
  const toursHref = tenant ? `/?tenant=${tenant}#tours` : "/";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-xl rounded-lg text-center">
        <CardContent className="p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-700" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-normal text-slate-950">
            Захиалга амжилттай үүслээ.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Таны захиалга pending төлөвтэй бүртгэгдлээ. Байгууллага тантай холбогдож
            баталгаажуулна.
          </p>
          {booking ? (
            <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
              Захиалгын дугаар: <span className="font-medium text-slate-950">{booking}</span>
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link href={toursHref}>Аяллууд харах</Link>
            </Button>
            <Button asChild>
              <Link href={homeHref}>Нүүр рүү буцах</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
