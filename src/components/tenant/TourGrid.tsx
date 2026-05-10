import { EmptyState } from "@/components/tenant/EmptyState";
import { TourCard } from "@/components/tenant/TourCard";
import type { PublicTenant, TenantPublicTour } from "@/lib/types";

type TourGridProps = {
  tenant: PublicTenant;
  tours: TenantPublicTour[];
};

export function TourGrid({ tenant, tours }: TourGridProps) {
  return (
    <section id="tours" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--tenant-primary)]">
            Аяллын хөтөлбөрүүд
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Нийтлэгдсэн аяллууд
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {tenant.name}-ийн боломжит аяллуудаас сонгож дэлгэрэнгүй мэдээлэлтэй танилцаарай.
          </p>
        </div>

        {tours.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tenant={tenant} tour={tour} />
            ))}
          </div>
        ) : (
          <EmptyState message="Энэ байгууллага одоогоор нийтлэгдсэн аялалгүй байна." />
        )}
      </div>
    </section>
  );
}
