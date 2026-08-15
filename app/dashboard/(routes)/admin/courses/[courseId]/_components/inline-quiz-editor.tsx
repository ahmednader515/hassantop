"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditQuizForm } from "@/app/dashboard/(routes)/admin/quizzes/[quizId]/_components/edit-quiz-form";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { assessmentUi } from "@/lib/assessment-labels";
import type { AssessmentKind } from "@prisma/client";

interface InlineQuizEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  quizId: string | null;
}

export function InlineQuizEditor({
  open,
  onOpenChange,
  courseId,
  quizId,
}: InlineQuizEditorProps) {
  const router = useRouter();
  const [kind, setKind] = useState<AssessmentKind>("QUIZ");
  const labels = assessmentUi(kind);

  useEffect(() => {
    if (!quizId || !open) return;
    let cancelled = false;
    fetch(`/api/admin/quizzes/${quizId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.kind) {
          setKind(data.kind);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [quizId, open]);

  const onSaved = () => {
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        dir="rtl"
        className="flex w-full max-w-full flex-col gap-0 overflow-hidden border-l p-0 sm:max-w-xl md:max-w-2xl lg:max-w-4xl"
      >
        <SheetHeader className="relative space-y-1 border-b px-4 py-4 pr-14 text-right sm:px-6 sm:pr-16">
          <SheetClose className="absolute left-3 top-3 rounded-md p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-5 w-5" />
            <span className="sr-only">إغلاق</span>
          </SheetClose>
          <SheetTitle className="text-lg sm:text-xl">{labels.sheetTitle}</SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {labels.sheetDescription}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          {!quizId && (
            <p className="text-center text-sm text-muted-foreground">
              لم يُحدد {labels.tag}.
            </p>
          )}
          {quizId && open && (
            <div className="pb-8">
              <EditQuizForm
                key={quizId}
                quizId={quizId}
                fixedCourseId={courseId}
                variant="sheet"
                dashboardPath={`/dashboard/admin/courses/${courseId}?tab=content`}
                onSaved={onSaved}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
