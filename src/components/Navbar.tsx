import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

const Navbar = async () => {
  const user = await currentUser();

  // Initialize counts
  let messageCount = 0;
  let announcementCount = 0;

  // Sample role-based conditions for announcements.
  // For teachers: announcements where the class has lessons taught by the teacher.
  // For students: announcements where the class has a student with the current user's id.
  // For parents: announcements where the class has a student with parentId equals currentUser.id.
  const roleConditions = {
    teacher: { lessons: { some: { teacherId: user?.id! } } },
    student: { students: { some: { id: user?.id! } } },
    parent: { students: { some: { parentId: user?.id! } } },
  };

  if (user) {
    // Count messages where the recipient is one of the allowed categories.
    messageCount = await prisma.message.count({
      where: {
        recipient: { in: ["teachers", "students", "parents"] },
      },
    });

    // Count announcements that are either global (no classId) or tied to a class that meets the role condition.
    // Adjust the condition for announcements based on your schema design.
    announcementCount = await prisma.announcement.count({
      where: {
        OR: [
          { classId: null }, // Global announcement
          { class: roleConditions[user.publicMetadata.role as keyof typeof roleConditions] },
        ],
      },
    });
  }

  return (
    <div className="flex items-center justify-between p-4">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="Search" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        {/* Message icon with dynamic count badge */}
        <Link href="/list/messages">
          <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
            <Image src="/message.png" alt="Messages" width={20} height={20} />
            {messageCount > 0 && (
              <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-sm">
                {messageCount}
              </div>
            )}
          </div>
        </Link>
        {/* Announcement icon with dynamic count badge */}
        <Link href="/list/announcements">
          <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
            <Image src="/announcement.png" alt="Announcements" width={20} height={20} />
            {announcementCount > 0 && (
              <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-sm">
                {announcementCount}
              </div>
            )}
          </div>
        </Link>
        {/* User details */}
        <Link href="/profile" className="cursor-pointer">
            <div className="flex flex-col">
                <span className="text-xs leading-3 font-medium">
                {user
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : "Guest"}
                </span>
                <span className="text-[10px] text-gray-500 text-right">
                {user?.publicMetadata.role as string}
                </span>
            </div>
          </Link>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
