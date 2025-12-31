/**
 * Type definitions for column-based module ordering with multi-breakpoint support
 */

export interface ModuleOrder {
  col1: string[];
  col2: string[];
  col3: string[];
  col4: string[];
  col5: string[];
}

export const DEFAULT_MODULE_ORDER: ModuleOrder = {
  col1: [],
  col2: [],
  col3: [],
  col4: [],
  col5: [],
};

/**
 * Multi-breakpoint layouts: one layout per column count (1-5)
 */
export interface ModuleLayouts {
  1: { col1: string[] };
  2: { col1: string[]; col2: string[] };
  3: { col1: string[]; col2: string[]; col3: string[] };
  4: { col1: string[]; col2: string[]; col3: string[]; col4: string[] };
  5: { col1: string[]; col2: string[]; col3: string[]; col4: string[]; col5: string[] };
}

export const DEFAULT_MODULE_LAYOUTS: ModuleLayouts = {
  1: { col1: [] },
  2: { col1: [], col2: [] },
  3: { col1: [], col2: [], col3: [] },
  4: { col1: [], col2: [], col3: [], col4: [] },
  5: { col1: [], col2: [], col3: [], col4: [], col5: [] },
};

export type ColumnCount = 1 | 2 | 3 | 4 | 5;

export type ColumnId = "col1" | "col2" | "col3" | "col4" | "col5";

export const COLUMN_IDS: ColumnId[] = ["col1", "col2", "col3", "col4", "col5"];

/**
 * Get the number of visible columns based on breakpoint
 */
export function getVisibleColumnIds(breakpoint: number): ColumnId[] {
  return COLUMN_IDS.slice(0, breakpoint) as ColumnId[];
}

/**
 * Distribute modules across columns evenly
 */
export function distributeModulesAcrossColumns(
  modules: string[],
  columnCount: number
): ModuleOrder {
  const order: ModuleOrder = { ...DEFAULT_MODULE_ORDER };
  const visibleColumns = getVisibleColumnIds(columnCount);

  modules.forEach((moduleId, index) => {
    const columnIndex = index % columnCount;
    const columnId = visibleColumns[columnIndex];
    if (columnId) {
      order[columnId].push(moduleId);
    }
  });

  return order;
}

/**
 * Flatten column order to get all module IDs in order
 */
export function flattenModuleOrder(
  order: ModuleOrder,
  columnCount: number
): string[] {
  const visibleColumns = getVisibleColumnIds(columnCount);
  const result: string[] = [];

  // Get max length to iterate through rows
  const maxLength = Math.max(
    ...visibleColumns.map((colId) => order[colId].length)
  );

  // Iterate row by row across columns (masonry order)
  for (let i = 0; i < maxLength; i++) {
    visibleColumns.forEach((colId) => {
      const moduleId = order[colId][i];
      if (moduleId) {
        result.push(moduleId);
      }
    });
  }

  return result;
}

/**
 * Get layout for specific column count from ModuleLayouts
 */
export function getLayoutForColumnCount(
  layouts: ModuleLayouts,
  columnCount: ColumnCount
): ModuleOrder {
  const layout = layouts[columnCount];

  // Extend layout to full ModuleOrder structure
  return {
    col1: layout.col1 || [],
    col2: (layout as any).col2 || [],
    col3: (layout as any).col3 || [],
    col4: (layout as any).col4 || [],
    col5: (layout as any).col5 || [],
  };
}

/**
 * Initialize a layout with modules distributed across available columns
 */
export function initializeLayoutForColumnCount(
  modules: string[],
  columnCount: ColumnCount
): ModuleOrder {
  const layout: ModuleOrder = { ...DEFAULT_MODULE_ORDER };
  const visibleColumns = getVisibleColumnIds(columnCount);

  modules.forEach((moduleId, index) => {
    const columnIndex = index % columnCount;
    const columnId = visibleColumns[columnIndex];
    if (columnId) {
      layout[columnId].push(moduleId);
    }
  });

  return layout;
}

/**
 * Update specific layout in ModuleLayouts
 */
export function updateLayoutInLayouts(
  layouts: ModuleLayouts,
  columnCount: ColumnCount,
  newLayout: ModuleOrder
): ModuleLayouts {
  const updated = { ...layouts };

  // Only store the columns relevant to this breakpoint
  switch (columnCount) {
    case 1:
      updated[1] = { col1: newLayout.col1 };
      break;
    case 2:
      updated[2] = { col1: newLayout.col1, col2: newLayout.col2 };
      break;
    case 3:
      updated[3] = { col1: newLayout.col1, col2: newLayout.col2, col3: newLayout.col3 };
      break;
    case 4:
      updated[4] = { col1: newLayout.col1, col2: newLayout.col2, col3: newLayout.col3, col4: newLayout.col4 };
      break;
    case 5:
      updated[5] = newLayout;
      break;
  }

  return updated;
}
