"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type CourseItem = { id: string; title: string; isPublished: boolean };

export function CourseOrderDialog({ courses }: { courses: CourseItem[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(courses);
    const [saving, setSaving] = useState(false);
    const changed = items.some((item, index) => item.id !== courses[index]?.id);

    const move = (from: number, to: number) => {
        if (saving || to < 0 || to >= items.length) return;
        setItems(current => {
            const next = [...current];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            return next;
        });
    };

    const save = async () => {
        setSaving(true);
        try {
            const response = await fetch("/api/admin/courses/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseIds: items.map(item => item.id) }),
            });
            if (!response.ok) {
                if (response.status === 409 || response.status === 403) {
                    router.refresh();
                    throw new Error("تغيرت قائمة الكورسات. أغلق النافذة وأعد المحاولة");
                }
                throw new Error("تعذر حفظ الترتيب. حاول مرة أخرى");
            }
            toast.success("تم حفظ ترتيب الكورسات");
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "تعذر حفظ الترتيب");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={value => {
            if (saving) return;
            if (value) setItems(courses);
            setOpen(value);
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="min-h-11 gap-2" disabled={courses.length < 2}>
                    <ArrowUpDown className="h-4 w-4" />
                    ترتيب الكورسات
                </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>ترتيب الكورسات</DialogTitle>
                    <DialogDescription>
                        اسحب الكورسات أو استخدم الأسهم لتغيير ترتيبها، ثم احفظ. سيظهر هذا الترتيب في قائمة الكورسات وللطلاب.
                    </DialogDescription>
                </DialogHeader>
                <DragDropContext onDragEnd={({ source, destination }) => {
                    if (destination) move(source.index, destination.index);
                }}>
                    <Droppable droppableId="course-order">
                        {provided => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                {items.map((course, index) => (
                                    <Draggable key={course.id} draggableId={course.id} index={index} isDragDisabled={saving} disableInteractiveElementBlocking>
                                        {drag => (
                                            <div ref={drag.innerRef} {...drag.draggableProps} className="mb-2 flex items-center gap-2 rounded-lg border bg-card p-2 sm:p-3">
                                                <button type="button" {...drag.dragHandleProps} aria-label={`سحب ${course.title}`} disabled={saving} className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground">
                                                    <GripVertical className="h-5 w-5" />
                                                </button>
                                                <span className="text-sm text-muted-foreground">{index + 1}</span>
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <p className="break-words text-sm font-medium">{course.title}</p>
                                                    <Badge variant={course.isPublished ? "default" : "secondary"}>{course.isPublished ? "منشور" : "غير منشور"}</Badge>
                                                </div>
                                                <div className="flex shrink-0 flex-col sm:flex-row">
                                                    <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={`نقل ${course.title} لأعلى`} disabled={saving || index === 0} onClick={() => move(index, index - 1)}><ArrowUp className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={`نقل ${course.title} لأسفل`} disabled={saving || index === items.length - 1} onClick={() => move(index, index + 1)}><ArrowDown className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                <DialogFooter className="gap-2">
                    <Button onClick={() => void save()} disabled={saving || !changed} className="gap-2 bg-brand text-white hover:bg-brand/90">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {saving ? "جاري الحفظ..." : "حفظ الترتيب"}
                    </Button>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>إلغاء</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
