import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (session.user.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { userId } = await params;
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user || user.role !== "STUDENT") {
            return new NextResponse("Student not found", { status: 404 });
        }

        const purchases = await db.purchase.findMany({
            where: { userId },
            select: {
                id: true,
                status: true,
                createdAt: true,
                course: { select: { id: true, title: true, price: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        const chapterFilter = {
            courseId: { in: purchases.map(purchase => purchase.course.id) },
            isPublished: true,
        };
        const [allChapters, userProgress] = await Promise.all([
            db.chapter.findMany({
                where: chapterFilter,
                select: {
                    id: true,
                    title: true,
                    isPublished: true,
                    course: { select: { id: true, title: true } },
                },
                orderBy: [{ course: { title: "asc" } }, { position: "asc" }],
            }),
            db.userProgress.findMany({
                where: { userId, chapter: chapterFilter },
                select: {
                    id: true,
                    isCompleted: true,
                    updatedAt: true,
                    chapter: {
                        select: {
                            id: true,
                            title: true,
                            course: { select: { id: true, title: true } },
                        },
                    },
                },
            }),
        ]);

        return NextResponse.json({ purchases, allChapters, userProgress });
    } catch (error) {
        console.error("[ADMIN_STUDENT_PROGRESS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
