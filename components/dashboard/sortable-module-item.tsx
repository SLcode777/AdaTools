"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import { ReactNode } from "react";

interface SortableModuleItemProps {
  id: string;
  children: ReactNode;
}

export function SortableModuleItem({ id, children }: SortableModuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-opacity duration-200 ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
      {...attributes}
    >
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        className="absolute -top-3 left-1/2 -translate-x-1/2 p-1 rounded opacity-0 group-hover:opacity-100   hover:bg-primary/20 transition-opacity cursor-grab active:cursor-grabbing z-10"
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripHorizontal className="w-4 h-4  text-muted-foreground hover:text-primary " />
      </button>
      {children}
    </div>
  );
}
