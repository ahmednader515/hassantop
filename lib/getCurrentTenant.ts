/**
 * lib/getCurrentTenant.ts
 *
 * Server-side helper for App Router Server Components / Route Handlers.
 * Reads tenant identity headers set by middleware (`x-tenant-id`, etc.).
 *
 * Resolves tenant from host (Node runtime). Middleware only forwards
 * `x-tenant-host` to keep the Edge bundle under the 1 MB limit.
 *
 * TODO(multi-tenant): Prefer this helper (or request context) whenever
 * scoping queries by tenantId after models are updated.
 */

import { headers } from "next/headers";
import { getTenantByHost } from "@/lib/tenant";
import type { CurrentTenant } from "@/types/tenant";

/**
 * Returns the current request's tenant `{ id, slug, name }`, or null.
 */
export async function getCurrentTenant(): Promise<CurrentTenant | null> {
  const headerStore = await headers();

  const id = headerStore.get("x-tenant-id");
  const slug = headerStore.get("x-tenant-slug");
  const name = headerStore.get("x-tenant-name");

  if (id && slug) {
    return {
      id,
      slug,
      name: name || slug,
    };
  }

  // Fallback: resolve from host when middleware could not attach tenant ids.
  const host =
    headerStore.get("x-tenant-host") ||
    headerStore.get("host") ||
    "";

  if (!host) {
    return null;
  }

  const tenant = await getTenantByHost(host);
  if (!tenant) {
    return null;
  }

  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
  };
}
