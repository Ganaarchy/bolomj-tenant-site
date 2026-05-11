import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, MinusCircle, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookingForm } from "@/components/tenant/BookingForm";
import { SafeImage } from "@/components/tenant/SafeImage";
import { formatDate, formatDestination, formatDuration, formatPrice } from "@/lib/format";
import type { PublicTenant, TenantPublicTour } from "@/lib/types";

export function TourDetail({
  tenant,
  tour,
}: {
  tenant: PublicTenant;
  tour: TenantPublicTour;
}) {
  const imageSrc = tour.coverImageUrl || tour.cover_image_url || tenant.banner_url;
  const detailPhotos = tour.detailPhotos || [];
  const detailVideo = tour.detailVideo;
  const includes = splitLines(tour.includes_text);
  const excludes = splitLines(tour.excludes_text);

  return (
    <main>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-14">
          <div>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/?tenant=${tenant.slug}#tours`}>Аяллууд руу буцах</Link>
            </Button>
            <h1 className="mt-8 text-4xl font-semibold tracking-normal sm:text-5xl">{tour.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
              {tour.description || "Аяллын дэлгэрэнгүй мэдээлэл удахгүй нэмэгдэнэ."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Badge variant="secondary">{formatDestination(tour.destination_country, tour.destination_city)}</Badge>
              <Badge variant="secondary">{formatDuration(tour.duration_days)}</Badge>
              <Badge variant="secondary">{formatPrice(tour.price, tour.currency)}</Badge>
            </div>
            <Button asChild size="lg" className="mt-8">
              <a href="#booking">
                Захиалга өгөх
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-slate-800 shadow-2xl">
            <SafeImage
              src={imageSrc}
              alt={`${tour.title} аяллын зураг`}
              priority
              sizes="(min-width: 1024px) 420px, 100vw"
              fallback={<span className="px-6 text-center text-base font-medium">{tour.title}</span>}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div className="space-y-8">
            <Card className="rounded-lg border-slate-200">
              <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
                <InfoItem icon={<MapPin />} label="Чиглэл" value={formatDestination(tour.destination_country, tour.destination_city)} />
                <InfoItem icon={<CalendarDays />} label="Хугацаа" value={formatDuration(tour.duration_days)} />
                <InfoItem icon={<Users />} label="Суудлын тоо" value={tour.capacity ? `${tour.capacity} хүн` : "Тодорхойгүй"} />
                <InfoItem icon={<CalendarDays />} label="Эхлэх / дуусах" value={`${formatDate(tour.start_date)} - ${formatDate(tour.end_date)}`} />
              </CardContent>
            </Card>

            {detailPhotos.length ? (
              <section>
                <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Аяллын зургууд</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {detailPhotos.map((photo) => (
                    <figure key={photo.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <div className="relative aspect-[4/3] bg-slate-100">
                        <SafeImage
                          src={photo.url}
                          alt={photo.caption || `${tour.title} аяллын зураг`}
                          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                          fallback={<span className="px-4 text-center text-sm font-medium">{photo.caption || tour.title}</span>}
                        />
                      </div>
                      {photo.caption ? (
                        <figcaption className="px-4 py-3 text-sm leading-5 text-slate-600">{photo.caption}</figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            {detailVideo ? (
              <section>
                <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Аяллын танилцуулга видео</h2>
                <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
                  <video
                    className="aspect-video w-full bg-slate-950"
                    controls
                    preload="metadata"
                    src={detailVideo.url}
                  />
                </div>
                {detailVideo.caption ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">{detailVideo.caption}</p>
                ) : null}
              </section>
            ) : null}

            {tour.meeting_point ? (
              <section>
                <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Уулзах цэг</h2>
                <p className="mt-3 text-base leading-7 text-slate-600">{tour.meeting_point}</p>
              </section>
            ) : null}

            <Separator />

            <div className="grid gap-8 md:grid-cols-2">
              <TextList title="Багтсан зүйлс" items={includes} empty="Багтсан зүйлсийн мэдээлэл нэмэгдээгүй байна." kind="include" />
              <TextList title="Багтаагүй зүйлс" items={excludes} empty="Багтаагүй зүйлсийн мэдээлэл нэмэгдээгүй байна." kind="exclude" />
            </div>
          </div>

          <aside id="booking" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-600">Нэг хүний үнэ</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">{formatPrice(tour.price, tour.currency)}</p>
              <p className="mt-2 text-sm text-slate-600">Захиалга pending төлөвтэй үүсэж, байгууллага баталгаажуулна.</p>
            </div>
            <BookingForm tenantSlug={tenant.slug} tour={tour} />
          </aside>
        </div>
      </section>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[var(--tenant-primary)]">
        {icon}
      </span>
      <div>
        <dt className="text-sm text-slate-500">{label}</dt>
        <dd className="mt-1 font-medium text-slate-950">{value}</dd>
      </div>
    </div>
  );
}

function TextList({
  title,
  items,
  empty,
  kind,
}: {
  title: string;
  items: string[];
  empty: string;
  kind: "include" | "exclude";
}) {
  const Icon = kind === "include" ? CheckCircle2 : MinusCircle;

  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h2>
      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--tenant-primary)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">{empty}</p>
      )}
    </section>
  );
}

function splitLines(value: string | null) {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
