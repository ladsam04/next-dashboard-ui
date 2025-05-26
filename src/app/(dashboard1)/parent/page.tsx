
import Announcements from "@/components/Annoucement";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


const ParentPage = async () => {
  const { userId } = await auth();
  const currentUserId = userId;
  
  const students = await prisma.student.findMany({
    where: {
      parentId: currentUserId!,
    },
  });

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8">
        {students.length > 0 ? (
          students.map((student) => (
            <div key={student.id} className="mb-4">
              <div className="h-full bg-white p-4 rounded-md shadow">
                <h1 className="text-xl font-semibold">
                  Schedule ({student.name + " " + student.surname})
                </h1>
                <BigCalendarContainer type="classId" id={student.classId} />
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-4 rounded-md shadow">
            <p className="text-lg text-gray-600">
              No students are associated with your account.
            </p>
          </div>
        )}
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
