"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ReactNode } from "react";
import { type ColumnId } from "@/src/types/module-order";

interface DroppableColumnProps {
  columnId: ColumnId;
  moduleIds: string[];
  children: ReactNode;
}

export function DroppableColumn({
  columnId,
  moduleIds,
  children,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id: columnId,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-6 flex-1 basis-0 min-w-0 min-h-[200px]"
    >
      <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}
