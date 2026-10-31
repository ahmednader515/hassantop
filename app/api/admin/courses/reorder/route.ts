import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const reorderSchema = z.object({
    courseIds: z.array(z.string().uuid()).min(1).refine(ids => new Set(ids).size === ids.length),
});

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
        if (session.user.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

        const parsed = reorderSchema.safeParse(await req.json().catch(() => null));
        if (!parsed.success) return new NextResponse("Invalid course order", { status: 400 });
        const { courseIds } = parsed.data;
        const userId = session.user.id;

        const result = await db.$transaction(async tx => {
            const courses = await tx.course.findMany({ where: { userId }, select: { id: true } });
            const ownedIds = new Set(courses.map(course => course.id));
            if (courseIds.some(id => !ownedIds.has(id))) return 403;
            if (courses.length !== courseIds.length) return 409;

            for (const [index, id] of courseIds.entries()) {
                await tx.course.update({ where: { id, userId }, data: { position: index + 1 } });
            }
            return 200;
        }, { isolationLevel: "Serializable" });

        if (result !== 200) return new NextResponse("Course list changed. Reload and try again.", { status: result });
        revalidatePath("/dashboard/admin/courses");
        revalidatePath("/dashboard/search");
        revalidatePath("/dashboard");
        revalidatePath("/");
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2034") {
            return new NextResponse("Course list changed. Try again.", { status: 409 });
        }
        console.error("[ADMIN_COURSES_REORDER]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
