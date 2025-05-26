"use client";

import TableSearch from "@/components/TableSearch";
import TableOptions from "@/components/TableOptions";
import { useRouter } from "next/navigation";

interface AnnouncementListTopProps {
  role: string;
}

const AnnouncementListTop = ({ role }: AnnouncementListTopProps) => {
  const router = useRouter();

  const handleSort = (sortOrder: "asc" | "desc") => {
    console.log("Sort order changed to:", sortOrder);
    // TODO: Update URL query parameters or local state to trigger sorting.
  };

  const handleFilter = (filterText: string) => {
    console.log("Filter text:", filterText);
    // TODO: Update URL query parameters or local state to trigger filtering.
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
      <TableSearch />
      <TableOptions onSort={handleSort} onFilter={handleFilter} />
    </div>
  );
};

export default AnnouncementListTop;
