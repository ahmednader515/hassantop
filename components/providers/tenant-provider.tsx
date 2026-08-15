/**
 * components/providers/tenant-provider.tsx
 *
 * React context that exposes the resolved tenant to Client Components.
 * Wrap the tree via the existing Providers composition — do not replace it.
 *
 * TODO(multi-tenant): Surface branding fields (logoUrl, primaryColor, …)
 * from CurrentTenant once the product UI is tenant-aware.
 */

"use client";

import { createContext, useMemo } from "react";
import type { CurrentTenant, TenantContextValue } from "@/types/tenant";

export const TenantContext = createContext<TenantContextValue>({
  tenant: null,
});

interface TenantProviderProps {
  tenant: CurrentTenant | null;
  children: React.ReactNode;
}

export function TenantProvider({ tenant, children }: TenantProviderProps) {
  const value = useMemo<TenantContextValue>(() => ({ tenant }), [tenant]);

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}
