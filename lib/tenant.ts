/**
 * lib/tenant.ts
 *
 * Host-based tenant resolution for the white-label SaaS foundation.
 *
 * Examples:
 *   almoheet.mordesu.tech  → Tenant where subdomain = "almoheet"
 *   courses.elhawy.com     → Tenant where customDomain = "courses.elhawy.com"
 *   localhost / 127.0.0.1  → Tenant where slug = "almoheet"
 *
 * Uses the Neon serverless driver adapter so this module is safe to import
 * from Next.js middleware (Edge) as well as Server Components / Route Handlers.
 *
 * TODO(multi-tenant): After tenantId is added to User, Course, Purchase, etc.,
 * use the resolved tenant id to scope all data queries.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import type { Tenant } from "@/types/tenant";

const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN?.toLowerCase() || "mordesu.tech";

const createTenantClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
};

declare global {
  // eslint-disable-next-line no-var
  var tenantPrisma: PrismaClient | undefined;
}

const tenantDb = globalThis.tenantPrisma ?? createTenantClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.tenantPrisma = tenantDb;
}

/** Strip port and normalize host for lookups. */
export function normalizeHost(host: string): string {
  return host.split(":")[0]?.toLowerCase().trim() ?? "";
}

export function isLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  );
}

/**
 * Resolve a Tenant from an incoming Host header value.
 * Returns null when no matching tenant row exists.
 */
export async function getTenantByHost(host: string): Promise<Tenant | null> {
  const hostname = normalizeHost(host);

  if (!hostname) {
    return null;
  }

  // Local development always maps to the default Almoheet tenant.
  if (isLocalHost(hostname)) {
    const localTenant = await tenantDb.tenant.findUnique({
      where: { slug: "almoheet" },
    });
    return localTenant;
  }

  // Subdomain on the shared root domain: {subdomain}.mordesu.tech
  const rootSuffix = `.${ROOT_DOMAIN}`;
  if (hostname.endsWith(rootSuffix) && hostname !== ROOT_DOMAIN) {
    const subdomain = hostname.slice(0, -rootSuffix.length);

    // Ignore empty / www apex-style hosts on the root domain.
    if (subdomain && subdomain !== "www") {
      const bySubdomain = await tenantDb.tenant.findUnique({
        where: { subdomain },
      });
      if (bySubdomain) {
        return bySubdomain;
      }
    }
  }

  // Custom domain exact match (e.g. courses.elhawy.com)
  const byCustomDomain = await tenantDb.tenant.findUnique({
    where: { customDomain: hostname },
  });

  return byCustomDomain;
}
