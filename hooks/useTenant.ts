/**
 * hooks/useTenant.ts
 *
 * Client hook for reading the current tenant from TenantProvider.
 *
 * Usage:
 *   const { tenant } = useTenant();
 *
 * TODO(multi-tenant): Use this hook for tenant-aware UI (branding, links)
 * once features are scoped per tenant. Do not gate auth with it.
 */

"use client";

import { useContext } from "react";
import { TenantContext } from "@/components/providers/tenant-provider";
import type { TenantContextValue } from "@/types/tenant";

export function useTenant(): TenantContextValue {
  return useContext(TenantContext);
}
