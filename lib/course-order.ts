import type { Prisma } from "@prisma/client";

// Preserve newest-first ordering until an admin saves a custom order.
export const courseOrderBy: Prisma.CourseOrderByWithRelationInput[] = [
    { position: "asc" },
    { createdAt: "desc" },
    { id: "asc" },
];
