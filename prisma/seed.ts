/**
 * prisma/seed.ts
 *
 * Seeds the default Almoheet tenant for local / primary production host.
 * Safe to re-run: skips creation when slug "almoheet" already exists.
 *
 * TODO(multi-tenant): Extend seed to create additional demo tenants once
 * tenant-scoped User / Course / Purchase data is introduced.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.tenant.findUnique({
    where: { slug: "almoheet" },
  });

  if (existing) {
    console.log('Tenant "almoheet" already exists — skipping seed.');
  } else {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Almoheet",
        slug: "almoheet",
        subdomain: "almoheet",
      },
    });
    console.log(`Created tenant: ${tenant.name} (${tenant.slug})`);
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
