import { Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { PublicTenant } from "@/lib/types";

export function ContactSection({ tenant }: { tenant: PublicTenant }) {
  const email = tenant.website.contact_email || tenant.email;
  const phone = tenant.website.contact_phone || tenant.phone;
  const address = tenant.website.address;

  return (
    <section className="bg-[var(--tenant-primary-soft)] py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--tenant-primary)]">
            Бидний тухай
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            {tenant.website.site_title || tenant.name}
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            {tenant.website.about_text ||
              tenant.description ||
              "Тус байгууллагын аяллын мэдээлэл болон холбоо барих сувгуудыг эндээс аваарай."}
          </p>
        </div>

        <Card className="rounded-lg border-slate-200">
          <CardContent className="space-y-5 p-6">
            <h3 className="text-xl font-semibold text-slate-950">Холбоо барих</h3>
            {phone ? (
              <a className="flex gap-3 text-sm text-slate-700 hover:text-slate-950" href={`tel:${phone}`}>
                <Phone className="mt-0.5 h-4 w-4 text-[var(--tenant-primary)]" />
                <span>{phone}</span>
              </a>
            ) : null}
            {email ? (
              <a className="flex gap-3 text-sm text-slate-700 hover:text-slate-950" href={`mailto:${email}`}>
                <Mail className="mt-0.5 h-4 w-4 text-[var(--tenant-primary)]" />
                <span>{email}</span>
              </a>
            ) : null}
            {address ? (
              <p className="flex gap-3 text-sm text-slate-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tenant-primary)]" />
                <span>{address}</span>
              </p>
            ) : null}
            {!phone && !email && !address ? (
              <p className="text-sm text-slate-600">Холбоо барих мэдээлэл удахгүй нэмэгдэнэ.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
