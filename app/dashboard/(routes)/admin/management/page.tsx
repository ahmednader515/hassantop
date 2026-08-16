"use client";

import { Suspense, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeacherUsersPanel } from "../_components/teacher-users-panel";
import { TeacherBalancesPanel } from "../_components/teacher-balances-panel";
import { TeacherAddCoursesPanel } from "../_components/teacher-add-courses-panel";
import { TeacherPasswordsPanel } from "../_components/teacher-passwords-panel";
import { CreateStudentAccountPanel } from "@/app/dashboard/_components/create-student-account-panel";

const TAB_VALUES = ["users", "balances", "courses", "passwords", "create-account"] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string | null): v is TabValue {
  return (
    v === "users" ||
    v === "balances" ||
    v === "courses" ||
    v === "passwords" ||
    v === "create-account"
  );
}

const TAB_TRIGGER_CLASS =
  "min-h-11 shrink-0 rounded-xl border border-border/70 bg-card px-4 text-sm font-semibold text-foreground shadow-sm " +
  "transition-all duration-200 ease-out " +
  "hover:border-brand/40 hover:bg-brand/10 hover:text-brand hover:shadow-md " +
  "active:scale-[0.97] active:bg-brand/20 active:shadow-none " +
  "data-[state=active]:border-brand data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-md " +
  "data-[state=active]:hover:bg-brand data-[state=active]:hover:text-white data-[state=active]:hover:border-brand " +
  "data-[state=active]:active:scale-[0.97] data-[state=active]:active:brightness-95 " +
  "focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2";

function TeacherManagementContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : "users";

  const setTab = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", value);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6" dir="rtl">
      <h1 className="text-right text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
        إدارة الطلاب والحسابات
      </h1>
      <Tabs value={activeTab} onValueChange={setTab} className="w-full">
        <TabsList className="flex h-auto w-full flex-row-reverse flex-nowrap items-stretch justify-start gap-2 overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] rounded-xl bg-transparent p-0 pb-1">
          <TabsTrigger value="users" className={TAB_TRIGGER_CLASS}>
            المستخدمين
          </TabsTrigger>
          <TabsTrigger value="balances" className={TAB_TRIGGER_CLASS}>
            الأرصدة
          </TabsTrigger>
          <TabsTrigger value="courses" className={TAB_TRIGGER_CLASS}>
            اضافة و حذف الكورسات
          </TabsTrigger>
          <TabsTrigger value="passwords" className={TAB_TRIGGER_CLASS}>
            كلمات المرور
          </TabsTrigger>
          <TabsTrigger value="create-account" className={TAB_TRIGGER_CLASS}>
            انشاء حساب طالب
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4 focus-visible:outline-none">
          <TeacherUsersPanel embedded />
        </TabsContent>
        <TabsContent value="balances" className="mt-4 focus-visible:outline-none">
          <TeacherBalancesPanel embedded />
        </TabsContent>
        <TabsContent value="courses" className="mt-4 focus-visible:outline-none">
          <TeacherAddCoursesPanel embedded />
        </TabsContent>
        <TabsContent value="passwords" className="mt-4 focus-visible:outline-none">
          <TeacherPasswordsPanel embedded />
        </TabsContent>
        <TabsContent value="create-account" className="mt-4 focus-visible:outline-none">
          <CreateStudentAccountPanel variant="admin" embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function TeacherManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <div className="text-center text-muted-foreground">جاري التحميل...</div>
        </div>
      }
    >
      <TeacherManagementContent />
    </Suspense>
  );
}
