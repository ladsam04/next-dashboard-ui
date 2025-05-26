import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Message, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

// In this simple example, we assume MessageList is the same as Message.
type MessageList = Message;

const MessagesPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Get authenticated user information and role from Clerk.
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Define table columns. For admin and teacher views include sender, recipient and actions.
  const columns =
    role === "admin" || role === "teacher"
      ? [
          { header: "Title", accessor: "title" },
          { header: "Content", accessor: "content" },
          { header: "Sender", accessor: "sender" },
          { header: "Recipient", accessor: "recipient" },
          { header: "Actions", accessor: "action" },
        ]
      : [
          { header: "Title", accessor: "title" },
          { header: "Content", accessor: "content" },
          { header: "Created", accessor: "createdAt" },
        ];

  // Render each message row.
  const renderRow = (item: MessageList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.title}</td>
      <td className="p-4">{item.content}</td>
      {role === "admin" || role === "teacher" ? (
        <>
          <td className="p-4">{item.senderId}</td>
          <td className="p-4">{item.recipient}</td>
        </>
      ) : null}
      <td className="p-4">
        {new Intl.DateTimeFormat("en-US").format(item.createdAt)}
      </td>
      {(role === "admin" ||
        (role === "teacher" && item.senderId === currentUserId)) && (
        <td className="p-4">
          <div className="flex items-center gap-2">
            <FormContainer table="message" type="update" data={item} />
            <FormContainer table="message" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // Get pagination and search parameters.
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page, 10) : 1;

  // Build a base search query.
  const query: Prisma.MessageWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && key === "search") {
        query.OR = [
          { title: { contains: value, mode: "insensitive" } },
          { content: { contains: value, mode: "insensitive" } },
        ];
      }
    }
  }

  // Role-based conditions:
  // - Admin sees everything.
  // - Teacher sees messages they sent OR messages with recipient "all" or "students_parents".
  // - Students/Parents see messages targeted to them (recipient "all" or "students_parents").
  if (role === "teacher") {
    query.AND = [
      {
        OR: [
          { senderId: currentUserId! },
          { recipient: { in: ["all", "students_parents"] } },
        ],
      },
    ];
  } else if (role === "student" || role === "parent") {
    query.AND = [{ recipient: { in: ["all", "students_parents"] } }];
  }

  // Fetch messages and count using Prisma.
  const [data, count] = await prisma.$transaction([
    prisma.message.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.message.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-6 rounded-md flex-1 m-4 mt-0 shadow-lg">
      {/* TOP SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {role === "admin"
            ? "All Messages"
            : role === "teacher"
            ? "My Messages"
            : "Messages"}
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition">
              <Image src="/filter.png" alt="Filter" width={16} height={16} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition">
              <Image src="/sort.png" alt="Sort" width={16} height={16} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="message" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* TABLE */}
      <div className="mt-6">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
      {/* PAGINATION */}
      <div className="mt-4">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default MessagesPage;
