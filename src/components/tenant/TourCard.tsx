import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SafeImage } from "@/components/tenant/SafeImage";
import { formatDestination, formatDuration, formatPrice } from "@/lib/format";
import type { PublicTenant, TenantPublicTour } from "@/lib/types";

type TourCardProps = {
  tenant: PublicTenant;
  tour: TenantPublicTour;
};

export function TourCard({ tenant, tour }: TourCardProps) {
  return (
    <Card className="group overflow-hidden rounded-lg border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <SafeImage
          src={tour.cover_image_url || tenant.banner_url}
          alt={`${tour.title} аяллын зураг`}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          fallback={<span className="px-4 text-center text-sm font-medium">{tour.title}</span>}
        />
        {tour.is_featured ? (
          <Badge className="absolute left-4 top-4 bg-white text-slate-950 shadow-sm">Онцлох</Badge>
        ) : null}
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-6 text-slate-950">{tour.title}</h3>
          <p className="shrink-0 text-right text-base font-semibold text-[var(--tenant-primary)]">
            {formatPrice(tour.price, tour.currency)}
          </p>
        </div>
        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
          {tour.description || "Аяллын дэлгэрэнгүй мэдээллийг үзнэ үү."}
        </p>
        <dl className="mt-5 grid gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--tenant-primary)]" />
            <dd>{formatDestination(tour.destination_country, tour.destination_city)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[var(--tenant-primary)]" />
            <dd>{formatDuration(tour.duration_days)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--tenant-primary)]" />
            <dd>{tour.capacity ? `${tour.capacity} хүн` : "Суудлын тоо тодорхойгүй"}</dd>
          </div>
        </dl>
        <Button asChild className="mt-5 w-full">
          <Link href={`/tours/${tour.slug}?tenant=${tenant.slug}`}>Дэлгэрэнгүй харах</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
