"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Search, Eye, BookOpen, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface User {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    _count: {
        purchases: number;
        userProgress: number;
    };
}

interface UserProgress {
    id: string;
    isCompleted: boolean;
    updatedAt: string;
    chapter: {
        id: string;
        title: string;
        course: {
            id: string;
            title: string;
        };
    };
}

interface Chapter {
    id: string;
    title: string;
    isPublished: boolean;
    course: {
        id: string;
        title: string;
    };
}

interface Purchase {
    id: string;
    status: string;
    createdAt: string;
    course: {
        id: string;
        title: string;
        price: number | null;
    };
}

export function AdminProgressPanel({ embedded = false, variant = "admin-assistant" }: {
    embedded?: boolean;
    variant?: "admin" | "admin-assistant";
}) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
    const [userPurchases, setUserPurchases] = useState<Purchase[]>([]);
    const [allChapters, setAllChapters] = useState<Chapter[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(false);
    const [usersError, setUsersError] = useState(false);
    const [progressError, setProgressError] = useState(false);
    const progressRequest = useRef(0);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setUsersError(false);
        try {
            const response = await fetch(`/api/${variant}/users`);
            if (!response.ok) throw new Error("Failed to load students");
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsersError(true);
        } finally {
            setLoading(false);
        }
    }, [variant]);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    const fetchUserProgress = async (userId: string) => {
        const request = ++progressRequest.current;
        setLoadingProgress(true);
        setProgressError(false);
        setUserProgress([]);
        setUserPurchases([]);
        setAllChapters([]);
        try {
            const response = await fetch(`/api/${variant}/users/${userId}/progress`);
            if (!response.ok) throw new Error("Failed to load progress");
            const data = await response.json();
            if (request !== progressRequest.current) return;
            setUserProgress(data.userProgress);
            setUserPurchases(data.purchases);
            setAllChapters(data.allChapters || []);
        } catch (error) {
            console.error("Error fetching user progress:", error);
            if (request === progressRequest.current) setProgressError(true);
        } finally {
            if (request === progressRequest.current) setLoadingProgress(false);
        }
    };

    const handleViewProgress = (user: User) => {
        setSelectedUser(user);
        fetchUserProgress(user.id);
        setIsDialogOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        user.phoneNumber.includes(searchTerm.trim())
    );

    const studentUsers = filteredUsers.filter(user => user.role === "STUDENT");

    const availableProgress = userProgress.filter(p => allChapters.some(chapter => chapter.id === p.chapter.id));
    const completedProgress = availableProgress.filter(p => p.isCompleted).length;
    const inProgressChapters = availableProgress.filter(p => !p.isCompleted).length;
    const totalAvailableChapters = allChapters.length;
    const notStartedChapters = totalAvailableChapters - completedProgress - inProgressChapters;
    const progressPercentage = totalAvailableChapters > 0 ? (completedProgress / totalAvailableChapters) * 100 : 0;

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">جاري التحميل...</div>
            </div>
        );
    }

    return (
        <div className={`${embedded ? "" : "p-4 md:p-6"} space-y-6 text-right`} dir="rtl">
            <div className="flex items-center justify-between">
                <h1 className="text-right text-3xl font-bold text-gray-900 dark:text-white">
                    تقدم الطلاب
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة الطلاب</CardTitle>
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="البحث بالاسم أو رقم الهاتف..."
                            aria-label="البحث بالاسم أو رقم الهاتف"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {usersError ? (
                        <div className="space-y-3 py-8 text-center" role="alert">
                            <p>تعذر تحميل الطلاب</p>
                            <Button variant="outline" onClick={() => void fetchUsers()}>إعادة المحاولة</Button>
                        </div>
                    ) : (
                    <Table>
                                                 <TableHeader>
                             <TableRow>
                                 <TableHead className="text-right">الاسم</TableHead>
                                 <TableHead className="text-right">رقم الهاتف</TableHead>
                                 <TableHead className="text-right">الكورسات المشتراة</TableHead>
                                 <TableHead className="text-right">الدروس المسجلة</TableHead>
                                 <TableHead className="text-right">الإجراءات</TableHead>
                             </TableRow>
                         </TableHeader>
                        <TableBody>
                            {studentUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                        {searchTerm.trim() ? "لا يوجد طلاب مطابقون للبحث" : "لا يوجد طلاب حتى الآن"}
                                    </TableCell>
                                </TableRow>
                            )}
                            {studentUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell label="الاسم" className="font-medium">
                                        {user.fullName}
                                    </TableCell>
                                    <TableCell label="رقم الهاتف">{user.phoneNumber}</TableCell>
                                    <TableCell label="الكورسات المشتراة">
                                        <Badge variant="outline">
                                            {user._count.purchases} كورس
                                        </Badge>
                                    </TableCell>
                                    <TableCell label="التقدم">
                                        <Badge variant="secondary">
                                            {user._count.userProgress} درس
                                        </Badge>
                                    </TableCell>
                                    <TableCell label="الإجراءات">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleViewProgress(user)}
                                        >
                                            <Eye className="h-4 w-4" />
                                            عرض التقدم
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>
                            تقدم {selectedUser?.fullName}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {loadingProgress ? (
                        <div className="text-center py-8">جاري التحميل...</div>
                    ) : progressError ? (
                        <div className="space-y-3 py-8 text-center" role="alert">
                            <p>تعذر تحميل تقدم الطالب</p>
                            <Button variant="outline" onClick={() => selectedUser && void fetchUserProgress(selectedUser.id)}>إعادة المحاولة</Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Progress Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>ملخص التقدم</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span>نسبة الإنجاز</span>
                                            <span className="font-bold">{progressPercentage.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={progressPercentage} className="w-full" />
                                        <p className="text-sm text-muted-foreground">التقدم في الدروس المنشورة للكورسات المشتراة</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-green-600">{completedProgress}</div>
                                                <div className="text-sm text-muted-foreground">مكتمل</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-brand">{inProgressChapters}</div>
                                                <div className="text-sm text-muted-foreground">قيد التقدم</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-gray-600">{notStartedChapters}</div>
                                                <div className="text-sm text-muted-foreground">لم يبدأ</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Purchased Courses */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>الكورسات المشتراة</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                                                                 <TableHeader>
                                             <TableRow>
                                                 <TableHead className="text-right">اسم الكورس</TableHead>
                                                 <TableHead className="text-right">السعر</TableHead>
                                                 <TableHead className="text-right">الحالة</TableHead>
                                                 <TableHead className="text-right">تاريخ الشراء</TableHead>
                                             </TableRow>
                                         </TableHeader>
                                        <TableBody>
                                            {userPurchases.length === 0 && (
                                                <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">لا توجد كورسات مشتراة</TableCell></TableRow>
                                            )}
                                            {userPurchases.map((purchase) => (
                                                <TableRow key={purchase.id}>
                                                    <TableCell label="اسم الكورس" className="font-medium">
                                                        {purchase.course.title}
                                                    </TableCell>
                                                    <TableCell label="السعر">
                                                        {purchase.course.price ?? 0} جنيه
                                                    </TableCell>
                                                    <TableCell label="الحالة">
                                                        <Badge variant={purchase.status === "ACTIVE" ? "default" : "secondary"}>
                                                            {purchase.status === "ACTIVE" ? "نشط" : "غير نشط"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell label="تاريخ الشراء">
                                                        {format(new Date(purchase.createdAt), "dd/MM/yyyy", { locale: ar })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Progress Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>تفاصيل التقدم</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                                                                 <TableHeader>
                                             <TableRow>
                                                 <TableHead className="text-right">الكورس</TableHead>
                                                 <TableHead className="text-right">الدرس</TableHead>
                                                 <TableHead className="text-right">الحالة</TableHead>
                                                 <TableHead className="text-right">آخر تحديث</TableHead>
                                             </TableRow>
                                         </TableHeader>
                                        <TableBody>
                                            {allChapters.length === 0 && (
                                                <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">لا توجد دروس منشورة في الكورسات المشتراة</TableCell></TableRow>
                                            )}
                                            {allChapters.map((chapter) => {
                                                const progress = userProgress.find(p => p.chapter.id === chapter.id);
                                                return (
                                                    <TableRow key={chapter.id}>
                                                        <TableCell label="الكورس" className="font-medium">
                                                            {chapter.course.title}
                                                        </TableCell>
                                                        <TableCell label="الدرس">
                                                            {chapter.title}
                                                        </TableCell>
                                                        <TableCell label="الحالة">
                                                            {progress ? (
                                                                progress.isCompleted ? (
                                                                    <Badge variant="default" className="flex items-center gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        مكتمل
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        قيد التقدم
                                                                    </Badge>
                                                                )
                                                            ) : (
                                                                <Badge variant="outline" className="flex items-center gap-1">
                                                                    <BookOpen className="h-3 w-3" />
                                                                    لم يبدأ
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell label="آخر تحديث">
                                                            {progress ? (
                                                                format(new Date(progress.updatedAt), "dd/MM/yyyy", { locale: ar })
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
