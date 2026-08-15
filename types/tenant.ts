/**
 * types/tenant.ts
 *
 * Shared TypeScript contracts for the white-label multi-tenant foundation.
 * Used by host resolution, React context, hooks, and Server Components.
 *
 * TODO(multi-tenant): Extend these types when tenant branding (logo, colors)
 * and tenant-scoped data models are wired into the product UI.
 */

/** Full tenant record shape as stored in Prisma (serializable subset). */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  customDomain: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/** Minimal tenant identity exposed to Server Components and client context. */
export interface CurrentTenant {
  id: string;
  slug: string;
  name: string;
}

/** Value provided by TenantProvider / useTenant. */
export interface TenantContextValue {
  tenant: CurrentTenant | null;
}
