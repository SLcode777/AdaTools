"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Folder, File } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/src/lib/utils";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export interface FileTreeProps {
  nodes: FileNode[];
  selectedFiles: Set<string>;
  onSelectionChange: (paths: Set<string>) => void;
}

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  selectedFiles: Set<string>;
  onSelectionChange: (paths: Set<string>) => void;
}

// Get all descendant paths recursively (outside component to avoid re-creation)
function getAllDescendantPaths(currentNode: FileNode): string[] {
  const paths: string[] = [];
  if (currentNode.type === "file") {
    paths.push(currentNode.path);
  }
  if (currentNode.children) {
    currentNode.children.forEach((child) => {
      paths.push(...getAllDescendantPaths(child));
    });
  }
  return paths;
}

function FileTreeItem({
  node,
  depth,
  selectedFiles,
  onSelectionChange,
}: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const isDirectory = node.type === "directory";
  const hasChildren = isDirectory && node.children && node.children.length > 0;

  // Check if this node is selected
  const isSelected = (() => {
    if (node.type === "file") {
      return selectedFiles.has(node.path);
    }
    // For directories, check if all children are selected
    const descendantPaths = getAllDescendantPaths(node);
    return (
      descendantPaths.length > 0 &&
      descendantPaths.every((path) => selectedFiles.has(path))
    );
  })();

  // Check if this directory is partially selected (some but not all children selected)
  const isIndeterminate = (() => {
    if (node.type === "file") return false;
    const descendantPaths = getAllDescendantPaths(node);
    const selectedCount = descendantPaths.filter((path) =>
      selectedFiles.has(path),
    ).length;
    return selectedCount > 0 && selectedCount < descendantPaths.length;
  })();

  const handleCheckboxChange = () => {
    const newSelection = new Set(selectedFiles);

    if (node.type === "file") {
      // Toggle single file
      if (newSelection.has(node.path)) {
        newSelection.delete(node.path);
      } else {
        newSelection.add(node.path);
      }
    } else {
      // Toggle all descendants
      const descendantPaths = getAllDescendantPaths(node);
      const allSelected = descendantPaths.every((path) =>
        newSelection.has(path),
      );

      if (allSelected) {
        // Deselect all descendants
        descendantPaths.forEach((path) => newSelection.delete(path));
      } else {
        // Select all descendants
        descendantPaths.forEach((path) => newSelection.add(path));
      }
    }

    onSelectionChange(newSelection);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 hover:bg-muted/50 dark:hover:bg-muted/30 rounded-none transition-colors cursor-pointer group",
          "border-l border-transparent hover:border-primary/20",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        {isDirectory && (
          <button
            onClick={handleToggleExpand}
            className="p-0 hover:text-primary transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-none"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground" />
            )}
          </button>
        )}

        {/* Spacer for files (no expand/collapse) */}
        {!isDirectory && <div className="size-4" />}

        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          data-indeterminate={isIndeterminate ? "true" : undefined}
          onCheckedChange={handleCheckboxChange}
          className={cn(
            isIndeterminate &&
              "bg-primary/20 border-primary data-checked:bg-primary/40",
          )}
          aria-label={`Select ${node.name}`}
        />

        {/* Icon */}
        {isDirectory ? (
          <Folder className="size-4 text-amber-500 dark:text-amber-400 shrink-0" />
        ) : (
          <File className="size-4 text-muted-foreground shrink-0" />
        )}

        {/* Name */}
        <span
          className={cn(
            "text-xs truncate",
            isDirectory ? "font-medium" : "text-muted-foreground",
          )}
        >
          {node.name}
        </span>
      </div>

      {/* Children */}
      {isDirectory && hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFiles={selectedFiles}
              onSelectionChange={onSelectionChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  nodes,
  selectedFiles,
  onSelectionChange,
}: FileTreeProps) {
  return (
    <div className="max-h-[600px] overflow-y-auto border border-border rounded-none bg-background dark:bg-input/10">
      <div className="py-2">
        {nodes.map((node) => (
          <FileTreeItem
            key={node.path}
            node={node}
            depth={0}
            selectedFiles={selectedFiles}
            onSelectionChange={onSelectionChange}
          />
        ))}
      </div>
    </div>
  );
}
