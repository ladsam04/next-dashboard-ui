import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import FormModal from "./Formmodal";


export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "message";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "attendance":
        const attendanceStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        const attendanceLessons = await prisma.lesson.findMany({
          select: { id: true, name: true },
        });
        relatedData = { students: attendanceStudents, lessons: attendanceLessons };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const teacherClasses = await prisma.class.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        relatedData = { subjects: teacherSubjects, classes: teacherClasses };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      case "parent":
        const parentStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { students: parentStudents };
        break;
      case "lesson":
        const lessonSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const lessonClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const lessonTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { subjects: lessonSubjects, classes: lessonClasses, teachers: lessonTeachers };
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;
      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      case "result":
        const resultExams = await prisma.exam.findMany({
          select: { id: true, title: true },
        });
        const resultAssignments = await prisma.assignment.findMany({
          select: { id: true, title: true },
        });
        const resultStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = {
          exams: resultExams,
          assignments: resultAssignments,
          students: resultStudents,
        };
        break;
      case "event":
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: eventClasses };
        break;
      case "announcement": 
        const announcementClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: announcementClasses };
        break;
      case "message":
        // If teacher, restrict recipient options to students, parents, or both.
        if (role === "teacher") {
          // For a teacher, get a list of students in the classes he/she teaches.
          const teacher = await prisma.teacher.findUnique({
            where: { id: currentUserId! },
            include: {
              classes: {
                include: {
                  students: {
                    select: { id: true, name: true, surname: true },
                  },
                },
              },
            },
          });

          // Combine students from all classes (if a student exists in more than one, deduplicate if necessary).
          let teacherStudents: { value: string; label: string }[] = [];
          teacher?.classes.forEach((cls) => {
            cls.students.forEach((st) => {
              teacherStudents.push({
                value: st.id,
                label: `${st.name} ${st.surname}`,
              });
            });
          });
          relatedData = { recipients: teacherStudents };
        } else {
          // Admin or others get a full list.
          relatedData = {
            recipients: [
              { value: "all", label: "All" },
              { value: "students", label: "Students" },
              { value: "teachers", label: "Teachers" },
              { value: "parents", label: "Parents" },
              { value: "students_parents", label: "Students & Parents" },
            ],
          };
        }
        break;
      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
