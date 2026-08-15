import type { AssessmentKind } from "@prisma/client";

/** UI copy for quiz vs homework — same flows, different Arabic naming. */
export function assessmentUi(kind: AssessmentKind) {
  if (kind === "HOMEWORK") {
    return {
      kind,
      tag: "واجب",
      tagParen: "(واجب)",
      newDefaultTitle: "واجب جديد",
      createPageTitle: "إنشاء واجب جديد",
      createSubmit: "إنشاء الواجب",
      createSaving: "جاري الحفظ...",
      backToAssessments: "العودة إلى الاختبارات والتقدم",
      backToCourseContent: "العودة إلى محتوى الكورس",
      titleField: "عنوان الواجب",
      titlePlaceholder: "أدخل عنوان الواجب",
      orderCardTitle: "ترتيب الواجب في الكورس",
      orderCardDesc:
        "اسحب الواجب الجديد إلى الموقع المطلوب بين الدروس والاختبارات والواجبات الموجودة",
      orderSectionDescEdit:
        "اسحب الواجب إلى الموقع المطلوب بين الدروس والاختبارات والواجبات الموجودة.",
      emptyCourseHint:
        "لا توجد دروس أو اختبارات أو واجبات في هذه الكورس. سيتم إضافة الواجب في الموقع الأول.",
      descriptionField: "وصف الواجب",
      descriptionPlaceholder: "أدخل وصف الواجب",
      descriptionHelpEdit: "يظهر للطلاب قبل أو أثناء الواجب حسب واجهة العرض.",
      timerField: "مدة الواجب (بالدقائق)",
      timerHintCreate: "اترك الحقل فارغاً إذا كنت لا تريد تحديد مدة للواجب",
      timerHintEdit: "اترك الحقل فارغاً إذا كنت لا تريد تحديد مدة للواجب.",
      attemptsHint: "عدد المرات التي يمكن للطالب إعادة الواجب.",
      createSuccess: "تم إنشاء الواجب بنجاح",
      createError: "حدث خطأ أثناء إنشاء الواجب",
      loadError: "حدث خطأ أثناء تحميل الواجب",
      updateSuccess: "تم تحديث الواجب بنجاح",
      updateError: "حدث خطأ أثناء تحديث الواجب",
      publishOn: "تم نشر الواجب",
      publishOff: "تم إلغاء نشر الواجب",
      reorderSuccess: "تم ترتيب الواجب بنجاح",
      reorderError: "حدث خطأ أثناء ترتيب الواجب",
      editPageTitle: "تعديل الواجب",
      sheetTitle: "تعديل الواجب",
      sheetDescription:
        "كل الأسئلة والإعدادات في هذه اللوحة — لا حاجة لصفحة أخرى. أغلق اللوحة للعودة لقائمة المحتوى.",
      dataSectionTitle: "بيانات الواجب",
      dataSectionDesc: "العنوان والكورس المرتبط بهذا الواجب.",
      fixedCourseHint:
        "مرتبط بهذا الكورس — لتغيير الكورس استخدم صفحة الاختبارات العامة.",
      publishStatusOn: "الواجب منشور",
      publishStatusOff: "الواجب غير منشور",
      publishHelpOn: "يمكن للطلاب رؤية هذا الواجب. يمكنك إلغاء النشر لإخفائه مؤقتاً.",
      publishHelpOff: "لن يكون الواجب مرئياً للطلاب حتى يتم نشره.",
      publishButton: "نشر الواجب",
      updateButton: "تحديث الواجب",
      studentFinish: "إنهاء الواجب",
      studentSubmitting: "جاري الإرسال...",
      studentSubmitSuccess: "تم إرسال الواجب بنجاح!",
      studentSubmitError: "حدث خطأ أثناء إرسال الواجب",
      studentLoadError: "حدث خطأ أثناء تحميل الواجب",
      studentNotFoundTitle: "الواجب غير موجود",
      studentAttemptsExhausted: "لقد استنفذت جميع المحاولات المسموحة لهذا الواجب",
      confirmFinishMulti: (n: number) =>
        `تأكد من إجابة جميع الأسئلة قبل إنهاء الواجب. يمكنك إعادة الواجب ${n} مرات أخرى.`,
      confirmFinishOnce: "تأكد من إجابة جميع الأسئلة قبل إنهاء الواجب. لا يمكنك العودة للواجب بعد الإرسال.",
      resultTitle: "نتيجة الواجب",
      retake: "إعادة الواجب",
      deleteConfirm: "هل أنت متأكد من حذف هذا الواجب؟",
      deleteSuccess: "تم حذف الواجب بنجاح",
      deleteError: "حدث خطأ أثناء حذف الواجب",
      notFound: "لم يتم العثور على الواجب",
      detailCardTitle: "تفاصيل الواجب",
      editAction: "تعديل الواجب",
      resultsListTitle: "نتائج الواجب",
      resultsInfoCard: "معلومات الواجب",
      resultsTitleLabel: "عنوان الواجب",
      studentResultHeading: "الواجب",
      studentInfoCardTitle: "معلومات الطالب والواجب",
      viewAllResults: "عرض جميع نتائج هذا الواجب",
      viewDetails: "عرض تفاصيل الواجب",
      contentSectionTitle: "محتوى الكورس (دروس واختبارات وواجبات)",
      contentSectionDesc:
        "أضف دروساً واختبارات وواجبات ورتّبها بالسحب. ابدأ بإضافة درس أو اختبار أو واجب من الأزرار أدناه.",
      emptyContentHint:
        "لا يوجد محتوى بعد. استخدم الأزرار أسفل الصفحة لإضافة أول درس أو اختبار أو واجب.",
      dragHint: "اسحب من المقبض ← لإعادة ترتيب الدروس والاختبارات والواجبات",
      deleteToast: "تم حذف الواجب",
    };
  }

  return {
    kind,
    tag: "اختبار",
    tagParen: "(اختبار)",
    newDefaultTitle: "اختبار جديد",
    createPageTitle: "إنشاء اختبار جديد",
    createSubmit: "إنشاء الاختبار",
    createSaving: "جاري الحفظ...",
    backToAssessments: "العودة إلى الاختبارات",
    backToCourseContent: "العودة إلى محتوى الكورس",
    titleField: "عنوان الاختبار",
    titlePlaceholder: "أدخل عنوان الاختبار",
    orderCardTitle: "ترتيب الاختبار في الكورس",
    orderCardDesc:
      "اسحب الاختبار الجديد إلى الموقع المطلوب بين الدروس والاختبارات الموجودة",
    orderSectionDescEdit:
      "اسحب الاختبار إلى الموقع المطلوب بين الدروس والاختبارات الموجودة.",
    emptyCourseHint:
      "لا توجد دروس أو اختبارات في هذه الكورس. سيتم إضافة الاختبار في الموقع الأول.",
    descriptionField: "وصف الاختبار",
    descriptionPlaceholder: "أدخل وصف الاختبار",
    descriptionHelpEdit: "يظهر للطلاب قبل أو أثناء الاختبار حسب واجهة العرض.",
    timerField: "مدة الاختبار (بالدقائق)",
    timerHintCreate: "اترك الحقل فارغاً إذا كنت لا تريد تحديد مدة للاختبار",
    timerHintEdit: "اترك الحقل فارغاً إذا كنت لا تريد تحديد مدة للاختبار.",
    attemptsHint: "عدد المرات التي يمكن للطالب إعادة الاختبار.",
    createSuccess: "تم إنشاء الاختبار بنجاح",
    createError: "حدث خطأ أثناء إنشاء الاختبار",
    loadError: "حدث خطأ أثناء تحميل الاختبار",
    updateSuccess: "تم تحديث الاختبار بنجاح",
    updateError: "حدث خطأ أثناء تحديث الاختبار",
    publishOn: "تم نشر الاختبار",
    publishOff: "تم إلغاء نشر الاختبار",
    reorderSuccess: "تم ترتيب الاختبار بنجاح",
    reorderError: "حدث خطأ أثناء ترتيب الاختبار",
    editPageTitle: "تعديل الاختبار",
    sheetTitle: "تعديل الاختبار",
    sheetDescription:
      "كل الأسئلة والإعدادات في هذه اللوحة — لا حاجة لصفحة أخرى. أغلق اللوحة للعودة لقائمة المحتوى.",
    dataSectionTitle: "بيانات الاختبار",
    dataSectionDesc: "العنوان والكورس المرتبط بهذا الاختبار.",
    fixedCourseHint: "مرتبط بهذا الكورس — لتغيير الكورس استخدم صفحة الاختبارات العامة.",
    publishStatusOn: "الاختبار منشور",
    publishStatusOff: "الاختبار غير منشور",
    publishHelpOn:
      "يمكن للطلاب رؤية هذا الاختبار. يمكنك إلغاء النشر لإخفائه مؤقتاً.",
    publishHelpOff: "لن يكون الاختبار مرئياً للطلاب حتى يتم نشره.",
    publishButton: "نشر الاختبار",
    updateButton: "تحديث الاختبار",
    studentFinish: "إنهاء الاختبار",
    studentSubmitting: "جاري الإرسال...",
    studentSubmitSuccess: "تم إرسال الاختبار بنجاح!",
    studentSubmitError: "حدث خطأ أثناء إرسال الاختبار",
    studentLoadError: "حدث خطأ أثناء تحميل الاختبار",
    studentNotFoundTitle: "الاختبار غير موجود",
    studentAttemptsExhausted: "لقد استنفذت جميع المحاولات المسموحة لهذا الاختبار",
    confirmFinishMulti: (n: number) =>
      `تأكد من إجابة جميع الأسئلة قبل إنهاء الاختبار. يمكنك إعادة الاختبار ${n} مرات أخرى.`,
    confirmFinishOnce:
      "تأكد من إجابة جميع الأسئلة قبل إنهاء الاختبار. لا يمكنك العودة للاختبار بعد الإرسال.",
    resultTitle: "نتيجة الاختبار",
    retake: "إعادة الاختبار",
    deleteConfirm: "هل أنت متأكد من حذف هذا الاختبار؟",
    deleteSuccess: "تم حذف الاختبار بنجاح",
    deleteError: "حدث خطأ أثناء حذف الاختبار",
    notFound: "لم يتم العثور على الاختبار",
    detailCardTitle: "تفاصيل الاختبار",
    editAction: "تعديل الاختبار",
    resultsListTitle: "نتائج الاختبار",
    resultsInfoCard: "معلومات الاختبار",
    resultsTitleLabel: "عنوان الاختبار",
    studentResultHeading: "الاختبار",
    studentInfoCardTitle: "معلومات الطالب والاختبار",
    viewAllResults: "عرض جميع نتائج هذا الاختبار",
    viewDetails: "عرض تفاصيل الاختبار",
    contentSectionTitle: "محتوى الكورس (دروس واختبارات)",
    contentSectionDesc:
      "أضف دروساً واختبارات ورتّبها بالسحب. ابدأ بإضافة درس أو اختبار من الأزرار أدناه.",
    emptyContentHint:
      "لا يوجد محتوى بعد. استخدم الأزرار أسفل الصفحة لإضافة أول درس أو اختبار.",
    dragHint: "اسحب من المقبض ← لإعادة ترتيب الدروس والاختبارات",
    deleteToast: "تم حذف الاختبار",
  };
}

export function quizTagLabel(kind: AssessmentKind | undefined) {
  if (kind === "HOMEWORK") return "واجب";
  return "اختبار";
}

/** Arabic summary for published assessments on a course card, e.g. "2 اختبارات، 1 واجب". */
export function formatCourseAssessmentCounts(quizzes: { kind?: AssessmentKind }[]) {
  if (quizzes.length === 0) return "";
  const quizN = quizzes.filter((q) => q.kind !== "HOMEWORK").length;
  const hwN = quizzes.filter((q) => q.kind === "HOMEWORK").length;
  const parts: string[] = [];
  if (quizN > 0) {
    parts.push(`${quizN} ${quizN === 1 ? "اختبار" : "اختبارات"}`);
  }
  if (hwN > 0) {
    parts.push(`${hwN} ${hwN === 1 ? "واجب" : "واجبات"}`);
  }
  return parts.join("، ");
}
