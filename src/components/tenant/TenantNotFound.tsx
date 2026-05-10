import Link from "next/link";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TenantNotFound({
  title = "Байгууллагын вебсайт олдсонгүй.",
  message = "Домэйн эсвэл локал хөгжүүлэлтийн tenant параметрээ шалгана уу.",
  actionLabel = "Жишээ tenant нээх",
  actionHref = "/?tenant=nomad",
}: {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <Building2 className="h-7 w-7 text-slate-500" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-normal text-slate-950">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{message}</p>
        <Button asChild className="mt-8">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </div>
    </main>
  );
}
