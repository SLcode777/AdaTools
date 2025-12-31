"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { ReactNode, useState } from "react";

interface SortableModuleGridProps {
  children: ReactNode;
  moduleIds: string[];
  onReorder: (newOrder: string[]) => void;
}

export function SortableModuleGrid({
  children,
  moduleIds,
  onReorder,
}: SortableModuleGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sensors for drag interaction
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = moduleIds.indexOf(active.id as string);
      const newIndex = moduleIds.indexOf(over.id as string);

      const newOrder = arrayMove(moduleIds, oldIndex, newIndex);
      onReorder(newOrder);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={moduleIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-6 auto-rows-min">
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}
