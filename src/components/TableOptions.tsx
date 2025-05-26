"use client";

import React, { useState } from "react";
import Image from "next/image";

interface TableOptionsProps {
  onSort: (sortOrder: "asc" | "desc") => void;
  onFilter: (filterText: string) => void;
}

const TableOptions: React.FC<TableOptionsProps> = ({ onSort, onFilter }) => {
  // Initialize the sort order state
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // When the sort button is clicked, toggle the sort order and notify the parent
  const handleSortClick = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    onSort(newOrder);
  };

  // When the filter button is clicked, prompt the user for filter text and notify the parent
  const handleFilterClick = () => {
    const filterText = prompt("Enter text to filter:");
    if (filterText !== null) {
      onFilter(filterText);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleFilterClick}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-lamaYellowDark transition-colors"
        title="Filter"
      >
        <Image src="/filter.png" alt="Filter" width={16} height={16} />
      </button>
      <button
        onClick={handleSortClick}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-lamaYellowDark transition-colors"
        title={`Sort (${sortOrder})`}
      >
        <Image src="/sort.png" alt="Sort" width={16} height={16} />
      </button>
    </div>
  );
};

export default TableOptions;
