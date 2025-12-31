"use client";

import {
  type ColumnId,
  type ModuleOrder,
  COLUMN_IDS,
} from "@/src/types/module-order";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ReactNode, useEffect, useRef, useState } from "react";
import { DroppableColumn } from "./droppable-column";

interface MultiColumnGridProps {
  moduleOrder: ModuleOrder;
  visibleColumns: ColumnId[];
  onReorder: (newOrder: ModuleOrder) => void;
  renderModule: (moduleId: string) => ReactNode;
  allModules: string[];
}

export function MultiColumnGrid({
  moduleOrder,
  visibleColumns,
  onReorder,
  renderModule,
  allModules,
}: MultiColumnGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Distribute unordered modules across visible columns
  const getModulesForColumn = (columnId: ColumnId): string[] => {
    const orderedInColumn = moduleOrder[columnId] || [];

    // Filter to only include modules that exist in allModules
    return orderedInColumn.filter((id) => allModules.includes(id));
  };

  // Add any modules not in any column
  const ensureAllModulesPlaced = (order: ModuleOrder): ModuleOrder => {
    const placedModules = new Set(COLUMN_IDS.flatMap((colId) => order[colId]));

    const unplacedModules = allModules.filter((id) => !placedModules.has(id));

    if (unplacedModules.length === 0) {
      return order;
    }

    // Check if layout is completely empty (first time at this breakpoint)
    const isLayoutEmpty = visibleColumns.every(
      (colId) => order[colId].length === 0
    );

    const newOrder = { ...order };

    if (isLayoutEmpty && visibleColumns.length > 0) {
      // Distribute modules evenly across all visible columns
      unplacedModules.forEach((moduleId, index) => {
        const columnIndex = index % visibleColumns.length;
        const columnId = visibleColumns[columnIndex];
        if (columnId) {
          newOrder[columnId].push(moduleId);
        }
      });
    } else if (visibleColumns.length > 0) {
      // Add new modules to the first column (for newly pinned modules)
      newOrder[visibleColumns[0]] = [
        ...unplacedModules,
        ...order[visibleColumns[0]],
      ];
    }

    return newOrder;
  };

  // Auto-save initial layout distribution
  const hasInitialized = useRef(false);
  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current) return;

    const placedModules = new Set(
      COLUMN_IDS.flatMap((colId) => moduleOrder[colId])
    );
    const unplacedModules = allModules.filter((id) => !placedModules.has(id));

    // Check if layout is empty and has unplaced modules
    const isLayoutEmpty = visibleColumns.every(
      (colId) => moduleOrder[colId].length === 0
    );

    if (
      isLayoutEmpty &&
      unplacedModules.length > 0 &&
      visibleColumns.length > 0
    ) {
      // Distribute and save
      const distributedOrder = ensureAllModulesPlaced(moduleOrder);
      onReorder(distributedOrder);
      hasInitialized.current = true;
    }
  }, [allModules, moduleOrder, visibleColumns, onReorder]);

  const handleDragStart = (event: DragStartEvent) => {
    console.log("🎯 Drag started:", event.active.id);
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    console.log("🔄 Drag over:", { activeId: active.id, overId: over?.id });

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Use finalOrder which has all modules placed
    const currentOrder = ensureAllModulesPlaced(moduleOrder);

    // Find source column
    let sourceColumn: ColumnId | null = null;
    for (const colId of COLUMN_IDS) {
      if (currentOrder[colId].includes(activeId)) {
        sourceColumn = colId;
        break;
      }
    }

    if (!sourceColumn) return;

    // Determine target column
    let targetColumn: ColumnId | null = null;
    if (COLUMN_IDS.includes(overId as ColumnId)) {
      // Dropped on column itself
      targetColumn = overId as ColumnId;
    } else {
      // Dropped on a module, find its column
      for (const colId of COLUMN_IDS) {
        if (currentOrder[colId].includes(overId)) {
          targetColumn = colId;
          break;
        }
      }
    }

    if (!targetColumn) return;

    if (sourceColumn === targetColumn) return;

    // Move module to target column
    const newOrder = { ...currentOrder };
    newOrder[sourceColumn] = newOrder[sourceColumn].filter(
      (id) => id !== activeId
    );

    // Add to target column at the position of overId if it's a module
    if (COLUMN_IDS.includes(overId as ColumnId)) {
      // Dropped on empty column
      newOrder[targetColumn] = [...newOrder[targetColumn], activeId];
    } else {
      // Dropped on a module
      const overIndex = newOrder[targetColumn].indexOf(overId);
      newOrder[targetColumn].splice(overIndex, 0, activeId);
    }

    onReorder(newOrder);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("✅ Drag ended:", { activeId: active.id, overId: over?.id });

    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Use finalOrder which has all modules placed
    const currentOrder = ensureAllModulesPlaced(moduleOrder);

    // Find active column
    let activeColumn: ColumnId | null = null;
    for (const colId of COLUMN_IDS) {
      if (currentOrder[colId].includes(activeId)) {
        activeColumn = colId;
        break;
      }
    }

    if (!activeColumn) return;

    // If dropped on a column container
    if (COLUMN_IDS.includes(overId as ColumnId)) {
      return; // Already handled in dragOver
    }

    // Reorder within same column
    const overColumn = COLUMN_IDS.find((colId) =>
      currentOrder[colId].includes(overId)
    );

    if (overColumn === activeColumn) {
      const columnItems = [...currentOrder[activeColumn]];
      const activeIndex = columnItems.indexOf(activeId);
      const overIndex = columnItems.indexOf(overId);

      if (activeIndex !== overIndex) {
        columnItems.splice(activeIndex, 1);
        columnItems.splice(overIndex, 0, activeId);

        const newOrder = {
          ...currentOrder,
          [activeColumn]: columnItems,
        };

        console.log("💾 Saving new order:", newOrder);
        onReorder(newOrder);
      }
    }
  };

  const finalOrder = ensureAllModulesPlaced(moduleOrder);

  // Filter modules to only include those that exist in allModules
  const filteredOrder: ModuleOrder = {
    col1: finalOrder.col1.filter((id) => allModules.includes(id)),
    col2: finalOrder.col2.filter((id) => allModules.includes(id)),
    col3: finalOrder.col3.filter((id) => allModules.includes(id)),
    col4: finalOrder.col4.filter((id) => allModules.includes(id)),
    col5: finalOrder.col5.filter((id) => allModules.includes(id)),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 items-start">
        {visibleColumns.map((columnId) => {
          return (
            <DroppableColumn
              key={columnId}
              columnId={columnId}
              moduleIds={filteredOrder[columnId]}
            >
              {filteredOrder[columnId].map((moduleId) =>
                renderModule(moduleId)
              )}
            </DroppableColumn>
          );
        })}
      </div>
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeId ? (
          <div className="opacity-80 rotate-0 scale-105 transition-transform">
            {renderModule(activeId)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
