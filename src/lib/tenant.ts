import { RESERVED_SUBDOMAINS } from "@/lib/types";

type SearchParamInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | null
  | undefined;

export function isReservedSubdomain(subdomain: string | null | undefined) {
  if (!subdomain) return true;
  return RESERVED_SUBDOMAINS.includes(
    subdomain.toLowerCase() as (typeof RESERVED_SUBDOMAINS)[number],
  );
}

function readSearchParam(searchParams: SearchParamInput, key: string) {
  if (!searchParams) return null;
  if (searchParams instanceof URLSearchParams) return searchParams.get(key);

  const value = searchParams[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function resolveTenantSlug(host: string | null | undefined, searchParams?: SearchParamInput) {
  const cleanHost = (host || "").split(",")[0]?.trim().toLowerCase();
  const hostname = cleanHost?.split(":")[0] || "";
  const tenantFromQuery = readSearchParam(searchParams, "tenant");

  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return tenantFromQuery || null;
  }

  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bolomj.space").toLowerCase();
  const subdomain = hostname.endsWith(`.${rootDomain}`)
    ? hostname.slice(0, -rootDomain.length - 1).split(".")[0]
    : hostname.split(".")[0];

  if (isReservedSubdomain(subdomain)) return null;
  return subdomain || null;
}

export function getTenantHomeUrl(slug: string) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bolomj.space";
  return `https://${slug}.${rootDomain}`;
}

export function getTenantTourUrl(slug: string, tourSlug: string) {
  return `${getTenantHomeUrl(slug)}/tours/${tourSlug}`;
}

export function getTenantLocalUrl(slug: string, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedPath}?tenant=${encodeURIComponent(slug)}`;
}

export function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }

  return params;
}
