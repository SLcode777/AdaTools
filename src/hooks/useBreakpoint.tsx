"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect the current number of columns based on screen width
 * Matches Tailwind breakpoints:
 * - < 768px (mobile): 1 column
 * - 768px-1023px (md/tablet): 2 columns
 * - 1024px-1919px (lg/desktop): 3 columns
 * - 1920px-2399px (3xl/ultra-wide): 4 columns
 * - >= 2400px (4xl/extreme): 5 columns
 */
export function useBreakpoint(): number {
  const [columnCount, setColumnCount] = useState(3); // Default to 3 columns

  useEffect(() => {
    const getColumnCount = () => {
      const width = window.innerWidth;

      if (width < 768) return 1; // mobile
      if (width < 1024) return 2; // tablet
      if (width < 1920) return 3; // desktop
      if (width < 2400) return 4; // ultra-wide
      return 5; // extreme
    };

    // Set initial value
    setColumnCount(getColumnCount());

    // Update on resize
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columnCount;
}
