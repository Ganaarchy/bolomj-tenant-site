import Link from "next/link";

import type { PublicTenant } from "@/lib/types";

export function TenantFooter({ tenant }: { tenant: PublicTenant }) {
  const homeHref = `/?tenant=${tenant.slug}`;
  const toursHref = `/?tenant=${tenant.slug}#tours`;

  return (
    <footer className="border-t bg-[var(--tenant-secondary)] text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-base font-semibold text-white">{tenant.name}</p>
          <p className="mt-1 text-sm text-slate-400">
            {tenant.website.address || tenant.email || "Bolomj tenant site"}
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm" aria-label="Доод цэс">
          <Link href={homeHref} className="rounded-sm hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tenant-secondary)]">
            Нүүр
          </Link>
          <Link href={toursHref} className="rounded-sm hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tenant-secondary)]">
            Аяллууд
          </Link>
          {tenant.website.facebook_url ? (
            <a
              href={tenant.website.facebook_url}
              className="rounded-sm hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tenant-secondary)]"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
          ) : null}
          {tenant.website.instagram_url ? (
            <a
              href={tenant.website.instagram_url}
              className="rounded-sm hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tenant-secondary)]"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}
