import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    const body = await req.json().catch(() => ({} as any));
    const forceConsume = body?.forceConsume === true;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: { id: resolvedParams.chapterId, courseId: resolvedParams.courseId },
      select: { id: true, maxViews: true, course: { select: { userId: true } } },
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    const isOwner = chapter.course.userId === userId;
    const maxViews = chapter.maxViews ?? 5;

    const existingProgress = await db.userProgress.findUnique({
      where: { userId_chapterId: { userId, chapterId: resolvedParams.chapterId } },
      select: { isCompleted: true },
    });

    // If already completed, only consume again when forced (re-complete).
    if (existingProgress?.isCompleted && !forceConsume) {
      return NextResponse.json({ userId, chapterId: resolvedParams.chapterId, isCompleted: true });
    }

    if (!isOwner) {
      const viewRow = await db.chapterView.findUnique({
        where: { userId_chapterId: { userId, chapterId: resolvedParams.chapterId } },
        select: { views: true },
      });
      const used = viewRow?.views ?? 0;
      if (used >= maxViews) {
        return new NextResponse("Maximum views reached for this lesson", { status: 400 });
      }
    }

    const userProgress = await db.$transaction(async (tx) => {
      if (existingProgress?.isCompleted && forceConsume) {
        // Remove completion tag then re-add it, as requested.
        await tx.userProgress.update({
          where: { userId_chapterId: { userId, chapterId: resolvedParams.chapterId } },
          data: { isCompleted: false },
        });
      }

      const progress = await tx.userProgress.upsert({
        where: {
          userId_chapterId: {
            userId,
            chapterId: resolvedParams.chapterId,
          },
        },
        update: {
          isCompleted: true,
        },
        create: {
          userId,
          chapterId: resolvedParams.chapterId,
          isCompleted: true,
        },
      });

      if (!isOwner) {
        await tx.chapterView.upsert({
          where: { userId_chapterId: { userId, chapterId: resolvedParams.chapterId } },
          create: { userId, chapterId: resolvedParams.chapterId, views: 1 },
          update: { views: { increment: 1 }, lastViewedAt: new Date() },
        });
      }

      return progress;
    });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[CHAPTER_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First check if the record exists
    const existingProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId: resolvedParams.chapterId,
        },
      },
    });

    if (!existingProgress) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await db.userProgress.delete({
      where: {
        userId_chapterId: {
          userId,
          chapterId: resolvedParams.chapterId,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[CHAPTER_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 