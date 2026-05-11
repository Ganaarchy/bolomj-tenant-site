import type { Metadata } from "next";
import { headers } from "next/headers";

import { ErrorState } from "@/components/tenant/ErrorState";
import { TenantFooter } from "@/components/tenant/TenantFooter";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantNotFound } from "@/components/tenant/TenantNotFound";
import { TenantShell } from "@/components/tenant/TenantShell";
import { TourDetail } from "@/components/tenant/TourDetail";
import { ApiError, apiFetch } from "@/lib/api";
import { resolveTenantSlug } from "@/lib/tenant";
import { normalizeTenantPublicTour } from "@/lib/tours";
import type { PublicTenant, TenantPublicTour } from "@/lib/types";

type TourPageProps = {
  params: Promise<{ tourSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: TourPageProps): Promise<Metadata> {
  const tenantSlug = await tenantSlugFromRequest(searchParams);
  const { tourSlug } = await params;

  if (!tenantSlug) {
    return {
      title: "Аялал олдсонгүй",
      description: "Tenant slug сонгогдоогүй тул аяллын дэлгэрэнгүй мэдээлэл ачаалах боломжгүй.",
    };
  }

  try {
    const [tenant, tourResponse] = await Promise.all([
      apiFetch<PublicTenant>(`/public/tenants/by-slug/${tenantSlug}`, { cache: "no-store" }),
      apiFetch<TenantPublicTour>(`/public/tenants/${tenantSlug}/tours/${tourSlug}`, {
        cache: "no-store",
      }),
    ]);
    const tour = normalizeTenantPublicTour(tourResponse);

    return {
      title: `${tour.title} - ${tenant.name}`,
      description: tour.description || `${tenant.name}-ийн аяллын дэлгэрэнгүй мэдээлэл.`,
    };
  } catch {
    return {
      title: "Аялал олдсонгүй",
      description: "Аяллын slug олдоогүй эсвэл аялал нийтлэгдээгүй байна.",
    };
  }
}

export default async function TourPage({ params, searchParams }: TourPageProps) {
  const tenantSlug = await tenantSlugFromRequest(searchParams);
  const { tourSlug } = await params;

  if (!tenantSlug) {
    return (
      <TenantNotFound
        title="Tenant сонгоогүй байна"
        message="Локал орчинд /?tenant=slug ашиглах эсвэл tenant subdomain-оор нэвтэрнэ үү."
      />
    );
  }

  let tenant: PublicTenant;
  let tour: TenantPublicTour;

  try {
    tenant = await apiFetch<PublicTenant>(`/public/tenants/by-slug/${tenantSlug}`, {
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <TenantNotFound
          title="Байгууллагын вебсайт олдсонгүй"
          message={`"${tenantSlug}" tenant идэвхтэй эсэх эсвэл slug зөв эсэхийг шалгана уу.`}
        />
      );
    }

    return (
      <ErrorState
        title="Байгууллагын мэдээлэл ачаалагдсангүй"
        message={error instanceof Error ? error.message : "Дахин оролдоно уу."}
      />
    );
  }

  try {
    const tourResponse = await apiFetch<TenantPublicTour>(
      `/public/tenants/${tenantSlug}/tours/${tourSlug}`,
      {
        cache: "no-store",
      },
    );
    tour = normalizeTenantPublicTour(tourResponse);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <TenantShell tenant={tenant}>
          <TenantHeader tenant={tenant} />
          <TenantNotFound
            title="Аялал олдсонгүй"
            message={`"${tourSlug}" аялал нийтлэгдсэн эсэх эсвэл slug зөв эсэхийг шалгана уу.`}
            actionLabel="Аяллууд руу буцах"
            actionHref={`/?tenant=${tenant.slug}#tours`}
          />
          <TenantFooter tenant={tenant} />
        </TenantShell>
      );
    }

    return (
      <ErrorState
        title="Аяллын мэдээлэл ачаалагдсангүй"
        message={error instanceof Error ? error.message : "Дахин оролдоно уу."}
      />
    );
  }

  return (
    <TenantShell tenant={tenant}>
      <TenantHeader tenant={tenant} />
      <TourDetail tenant={tenant} tour={tour} />
      <TenantFooter tenant={tenant} />
    </TenantShell>
  );
}

async function tenantSlugFromRequest(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
) {
  const [headersList, query] = await Promise.all([headers(), searchParams]);
  return resolveTenantSlug(headersList.get("x-forwarded-host") || headersList.get("host"), query);
}
