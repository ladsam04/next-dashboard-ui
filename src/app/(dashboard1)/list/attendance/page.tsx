import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Attendance, Lesson, Student, Class, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

// Extend the Attendance type to include related Student and Lesson data,
// with Lesson additionally including its Class data.
type AttendanceList = Attendance & {
  student: Student;
  lesson: Lesson & { class: Class };
};

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Get user and role info from Clerk.
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Define table columns.
  // For non-student roles, show Date, Student, Lesson, Present, and Actions.
  // For students, the attendance will be grouped by class so the per‐table columns are simpler.
  const columns =
    role === "student"
      ? [
          { header: "Date", accessor: "date" },
          { header: "Lesson", accessor: "lesson" },
          { header: "Present", accessor: "present" },
        ]
      : [
          { header: "Date", accessor: "date" },
          { header: "Student", accessor: "student" },
          { header: "Lesson", accessor: "lesson" },
          { header: "Present", accessor: "present" },
          { header: "Actions", accessor: "action" },
        ];

  // Define how each row is rendered for non-students.
  const renderRow = (item: AttendanceList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        {new Intl.DateTimeFormat("en-US").format(item.date)}
      </td>
      <td className="p-4">{`${item.student.name} ${item.student.surname}`}</td>
      <td className="p-4">{item.lesson.name}</td>
      <td className="p-4">{item.present ? "Yes" : "No"}</td>
      {(role === "admin" || role === "teacher") && (
        <td className="p-4">
          <div className="flex items-center gap-2">
            <FormContainer table="attendance" type="update" data={item} />
            <FormContainer table="attendance" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // Get and parse pagination and search parameters.
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page, 10) : 1;

  // Build a search query.
  // For example: if a "search" parameter is provided, filter by student name.
  const query: Prisma.AttendanceWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && key === "search") {
        query.student = { name: { contains: value, mode: "insensitive" } };
      }
    }
  }

  // Build role-based conditions:
  // - Teachers see attendance for lessons they conduct.
  // - Students see their own attendance.
  // - Parents see attendance for their children.
  const roleConditions: Record<string, Prisma.AttendanceWhereInput> = {
    teacher: { lesson: { teacherId: currentUserId! } },
    student: { studentId: currentUserId! },
    parent: { student: { parentId: currentUserId! } },
  };

  const roleQuery = (role && roleConditions[role]) || {};
  const finalQuery: Prisma.AttendanceWhereInput = {
    AND: [query, roleQuery],
  };

  // Fetch attendance data.
  // Ensure that for each attendance record, we include the student and (lesson + class).
  const [data, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: finalQuery,
      include: { student: true, lesson: { include: { class: true } } },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.attendance.count({ where: finalQuery }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        {role === "student" ? (
          <h1 className="hidden md:block text-lg font-semibold">
            My Attendance by Class
          </h1>
        ) : (
          <h1 className="hidden md:block text-lg font-semibold">
            Attendance Records
          </h1>
        )}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="attendance" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* TABLES */}
      {role === "student" ? (
        // Group records by class and render separate tables.
        Object.values(
          data.reduce(
            (acc, record) => {
              const classId = record.lesson.class.id;
              if (!acc[classId]) {
                acc[classId] = {
                  classInfo: record.lesson.class,
                  records: [] as AttendanceList[],
                };
              }
              acc[classId].records.push(record);
              return acc;
            },
            {} as Record<string, { classInfo: Class; records: AttendanceList[] }>
          )
        ).map((group) => (
          <div key={group.classInfo.id} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {group.classInfo.name}
            </h2>
            <Table
              columns={columns} // For students, columns are: Date, Lesson, Present.
              renderRow={(item: AttendanceList) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
                >
                  <td className="p-4">
                    {new Intl.DateTimeFormat("en-US").format(item.date)}
                  </td>
                  <td className="p-4">{item.lesson.name}</td>
                  <td className="p-4">{item.present ? "Yes" : "No"}</td>
                </tr>
              )}
              data={group.records}
            />
          </div>
        ))
      ) : (
        // For admin/teacher: show one unified table.
        <Table columns={columns} renderRow={renderRow} data={data} />
      )}
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AttendanceListPage;
