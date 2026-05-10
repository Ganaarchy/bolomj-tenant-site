import type { CSSProperties, ReactNode } from "react";

import type { PublicTenant } from "@/lib/types";

type TenantShellProps = {
  tenant: PublicTenant;
  children: ReactNode;
};

export function TenantShell({ tenant, children }: TenantShellProps) {
  const style = {
    "--tenant-primary": tenant.website.primary_color || "#2563eb",
    "--tenant-secondary": tenant.website.secondary_color || "#0f172a",
    "--tenant-primary-soft": `${tenant.website.primary_color || "#2563eb"}1a`,
  } as CSSProperties;

  return (
    <div style={style} className="min-h-screen bg-white text-slate-950">
      {children}
    </div>
  );
}
