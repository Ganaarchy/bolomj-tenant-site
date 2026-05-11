import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/tenant/SafeImage";
import { TenantAuthActions } from "@/components/tenant/TenantAuthActions";
import type { PublicTenant } from "@/lib/types";

type TenantHeaderProps = {
  tenant: PublicTenant;
};

export function TenantHeader({ tenant }: TenantHeaderProps) {
  const homeHref = `/?tenant=${tenant.slug}`;
  const toursHref = `/?tenant=${tenant.slug}#tours`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`${tenant.name} нүүр хуудас`}
        >
          <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white">
            <SafeImage
              src={tenant.logo_url}
              alt={`${tenant.name} лого`}
              sizes="40px"
              fallback={<span className="text-sm font-bold text-slate-700">{tenant.name.charAt(0)}</span>}
            />
          </span>
          <span className="truncate text-base font-semibold text-slate-950">{tenant.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Үндсэн цэс">
          <Button asChild variant="ghost">
            <Link href={homeHref}>Нүүр</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={toursHref}>Аяллууд</Link>
          </Button>
          <TenantAuthActions />
        </nav>

        <Button asChild size="sm" className="md:hidden">
          <Link href={toursHref}>
            <CalendarDays className="h-4 w-4" />
            Аялал
          </Link>
        </Button>
      </div>
    </header>
  );
}
