"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, Eye, Award, TrendingUp, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { quizTagLabel } from "@/lib/assessment-labels";
import type { AssessmentKind } from "@prisma/client";

interface Course {
  id: string;
  title: string;
}

interface Quiz {
  id: string;
  title: string;
  courseId: string;
  kind?: AssessmentKind;
  course: {
    title: string;
  };
  totalPoints: number;
}

interface QuizResult {
  id: string;
  studentId: string;
  user: {
    fullName: string;
    phoneNumber: string;
  };
  quizId: string;
  quiz: {
    title: string;
    kind?: AssessmentKind;
    course: {
      id: string;
      title: string;
    };
    totalPoints: number;
  };
  score: number;
  totalPoints: number;
  percentage: number;
  submittedAt: string;
  answers: QuizAnswer[];
}

interface QuizAnswer {
  questionId: string;
  question: {
    text: string;
    type: string;
    points: number;
  };
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export function TeacherGradesPanel({ embedded = false }: { embedded?: boolean }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  /** Filter progress table and stats: all assessments, quizzes only, or homework only */
  const [kindFilter, setKindFilter] = useState<"all" | "QUIZ" | "HOMEWORK">("all");

  useEffect(() => {
    fetchCourses();
    fetchQuizzes();
    fetchQuizResults();
  }, []);

  useEffect(() => {
    setSelectedQuiz("all");
  }, [kindFilter]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/admin/quizzes");
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const fetchQuizResults = async () => {
    try {
      const response = await fetch("/api/admin/quiz-results");
      if (response.ok) {
        const data = await response.json();
        setQuizResults(data);
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (result: QuizResult) => {
    setSelectedResult(result);
    setIsDialogOpen(true);
  };

  const kindScopedResults = quizResults.filter((result) => {
    if (kindFilter === "all") return true;
    return (result.quiz.kind ?? "QUIZ") === kindFilter;
  });

  const filteredResults = kindScopedResults.filter((result) => {
    const matchesSearch =
      result.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.quiz.course.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = !selectedCourse || selectedCourse === "all" || result.quiz.course.id === selectedCourse;
    const matchesQuiz = !selectedQuiz || selectedQuiz === "all" || result.quizId === selectedQuiz;

    return matchesSearch && matchesCourse && matchesQuiz;
  });

  const quizzesForSelect = quizzes.filter((q) => {
    if (kindFilter === "all") return true;
    return (q.kind ?? "QUIZ") === kindFilter;
  });

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 70) return "text-green-400";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: "default" as const, className: "bg-green-600 text-white" };
    if (percentage >= 80) return { variant: "default" as const, className: "bg-green-500 text-white" };
    if (percentage >= 70) return { variant: "default" as const, className: "bg-green-400 text-white" };
    if (percentage >= 60) return { variant: "default" as const, className: "bg-orange-600 text-white" };
    return { variant: "destructive" as const, className: "" };
  };

  if (loading) {
    return (
      <div className={embedded ? "py-4" : "p-6"}>
        <div className="text-right" dir="rtl">
          جاري التحميل...
        </div>
      </div>
    );
  }

  const wrapClass = embedded ? "space-y-4" : "p-6 space-y-6";

  return (
    <div className={wrapClass} dir="rtl">
      {!embedded && (
        <div className="flex items-center justify-between">
          <h1 className="text-right text-3xl font-bold text-gray-900 dark:text-white">درجات الطلاب</h1>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <span className="text-sm font-medium text-muted-foreground">عرض:</span>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "all" ? "default" : "outline"}
            className={kindFilter === "all" ? "bg-brand hover:bg-brand/90" : ""}
            onClick={() => setKindFilter("all")}
          >
            الكل
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "QUIZ" ? "default" : "outline"}
            className={kindFilter === "QUIZ" ? "bg-brand hover:bg-brand/90" : ""}
            onClick={() => setKindFilter("QUIZ")}
          >
            الاختبارات فقط
          </Button>
          <Button
            type="button"
            size="sm"
            variant={kindFilter === "HOMEWORK" ? "default" : "outline"}
            className={kindFilter === "HOMEWORK" ? "bg-brand hover:bg-brand/90" : ""}
            onClick={() => setKindFilter("HOMEWORK")}
          >
            الواجبات فقط
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row-reverse items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-muted-foreground">إجمالي الطلاب</p>
                <p className="text-2xl font-bold">{new Set(filteredResults.map((r) => r.studentId)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row-reverse items-center gap-2">
              <Award className="h-8 w-8 text-green-600" />
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-muted-foreground">متوسط الدرجات</p>
                <p className="text-2xl font-bold">
                  {filteredResults.length > 0
                    ? Math.round(filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row-reverse items-center gap-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-muted-foreground">أعلى درجة</p>
                <p className="text-2xl font-bold">
                  {filteredResults.length > 0 ? Math.max(...filteredResults.map((r) => r.percentage)) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row-reverse items-center gap-2">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-muted-foreground">إجمالي النتائج</p>
                <p className="text-2xl font-bold">{filteredResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">فلاتر البحث</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-right text-sm font-medium">البحث</label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3" />
                <Input
                  placeholder="البحث بالطالب أو الاختبار أو الواجب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-h-11 ps-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-right text-sm font-medium">الكورس</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="min-h-11">
                  <SelectValue placeholder="جميع الكورسات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الكورسات</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-right text-sm font-medium">
                {kindFilter === "HOMEWORK" ? "الواجب" : kindFilter === "QUIZ" ? "الاختبار" : "الاختبار أو الواجب"}
              </label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger className="min-h-11">
                  <SelectValue
                    placeholder={
                      kindFilter === "HOMEWORK"
                        ? "جميع الواجبات"
                        : kindFilter === "QUIZ"
                          ? "جميع الاختبارات"
                          : "الكل"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {kindFilter === "HOMEWORK"
                      ? "جميع الواجبات"
                      : kindFilter === "QUIZ"
                        ? "جميع الاختبارات"
                        : "جميع الاختبارات والواجبات"}
                  </SelectItem>
                  {quizzesForSelect.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title} ({quizTagLabel(quiz.kind)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">نتائج الاختبارات والواجبات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الطالب</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">الكورس</TableHead>
                <TableHead className="text-right">الدرجة</TableHead>
                <TableHead className="text-right">النسبة المئوية</TableHead>
                <TableHead className="text-right">تاريخ التقديم</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-muted-foreground"
                  >
                    لا توجد نتائج مطابقة للفلاتر الحالية.
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result) => {
                const gradeBadge = getGradeBadge(result.percentage);
                return (
                  <TableRow key={result.id}>
                    <TableCell label="الطالب" className="font-medium">
                      {result.user.fullName}
                    </TableCell>
                    <TableCell label="النوع">
                      <Badge variant="secondary">{quizTagLabel(result.quiz.kind)}</Badge>
                    </TableCell>
                    <TableCell label="العنوان">{result.quiz.title}</TableCell>
                    <TableCell label="الكورس">
                      <Badge variant="outline">{result.quiz.course.title}</Badge>
                    </TableCell>
                    <TableCell label="الدرجة">
                      <span className="font-bold">
                        {result.score}/{result.totalPoints}
                      </span>
                    </TableCell>
                    <TableCell label="النسبة المئوية">
                      <Badge {...gradeBadge}>{result.percentage}%</Badge>
                    </TableCell>
                    <TableCell label="تاريخ التقديم">
                      {format(new Date(result.submittedAt), "dd/MM/yyyy", { locale: ar })}
                    </TableCell>
                    <TableCell label="الإجراءات">
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-11 w-full justify-center gap-2 sm:w-auto"
                        onClick={() => handleViewResult(result)}
                      >
                        <Eye className="h-4 w-4 shrink-0" />
                        عرض التفاصيل
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">تفاصيل نتيجة {selectedResult?.user.fullName}</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ملخص النتيجة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedResult.score}/{selectedResult.totalPoints}
                      </div>
                      <div className="text-sm text-muted-foreground">الدرجة</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${getGradeColor(selectedResult.percentage)}`}>
                        {selectedResult.percentage}%
                      </div>
                      <div className="text-sm text-muted-foreground">النسبة المئوية</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedResult.answers.filter((a) => a.isCorrect).length}
                      </div>
                      <div className="text-sm text-muted-foreground">إجابات صحيحة</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {selectedResult.answers.filter((a) => !a.isCorrect).length}
                      </div>
                      <div className="text-sm text-muted-foreground">إجابات خاطئة</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">التقدم العام</span>
                      <span className="text-sm font-medium">{selectedResult.percentage}%</span>
                    </div>
                    <Progress value={selectedResult.percentage} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل الإجابات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedResult.answers.map((answer, index) => (
                      <div key={answer.questionId} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium">السؤال {index + 1}</h4>
                          <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                            {answer.isCorrect ? "صحيح" : "خاطئ"}
                          </Badge>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">{answer.question.text}</p>
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                          <div>
                            <span className="font-medium">إجابة الطالب:</span>
                            <p className="text-muted-foreground">{answer.studentAnswer}</p>
                          </div>
                          <div>
                            <span className="font-medium">الإجابة الصحيحة:</span>
                            <p className="text-green-600">{answer.correctAnswer}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="font-medium">الدرجات:</span>
                          <span className="text-muted-foreground">
                            {" "}
                            {answer.pointsEarned}/{answer.question.points}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
