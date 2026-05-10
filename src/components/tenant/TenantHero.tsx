import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/tenant/SafeImage";
import type { PublicTenant, TenantPublicTour } from "@/lib/types";

type TenantHeroProps = {
  tenant: PublicTenant;
  featuredTour?: TenantPublicTour;
};

export function TenantHero({ tenant, featuredTour }: TenantHeroProps) {
  const heroTitle = tenant.website.hero_title || tenant.website.site_title || tenant.name;
  const heroSubtitle =
    tenant.website.hero_subtitle || "Аяллаа хялбар сонгож захиалаарай";
  const contactPhone = tenant.website.contact_phone || tenant.phone;
  const toursHref = `/?tenant=${tenant.slug}#tours`;

  return (
    <section className="relative isolate overflow-hidden bg-[var(--tenant-secondary)] text-white">
      <div className="absolute inset-0 -z-10">
        <SafeImage
          src={tenant.banner_url}
          alt={`${tenant.name} нүүр зураг`}
          priority
          fallback={<span className="sr-only">Зураг байхгүй</span>}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--tenant-secondary)]/95 via-[var(--tenant-secondary)]/75 to-slate-900/30" />
      </div>

      <div className="mx-auto grid min-h-[560px] max-w-7xl items-end gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur">
            {tenant.website_subdomain || tenant.slug}.bolomj.space
          </p>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">
            {heroSubtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={toursHref}>
                Аяллууд харах
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {contactPhone ? (
              <Button asChild size="lg" variant="secondary">
                <a href={`tel:${contactPhone}`}>
                  <Phone className="h-4 w-4" />
                  Холбогдох
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
          <p className="text-sm font-medium text-slate-200">Онцлох аялал</p>
          <h2 className="mt-3 text-2xl font-semibold">
            {featuredTour?.title || "Шинэ аяллууд удахгүй нэмэгдэнэ"}
          </h2>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-200">
            <MapPin className="h-4 w-4" />
            {featuredTour
              ? [featuredTour.destination_city, featuredTour.destination_country].filter(Boolean).join(", ") ||
                "Чиглэл тодорхойгүй"
              : tenant.website.address || "Улаанбаатар"}
          </p>
          {featuredTour ? (
            <Button asChild className="mt-5 w-full" variant="secondary">
              <Link href={`/tours/${featuredTour.slug}?tenant=${tenant.slug}`}>Дэлгэрэнгүй</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
