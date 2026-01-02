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
  const getColumnCount = () => {
    if (typeof window === "undefined") return 3; //SSR default
    const width = window.innerWidth;

    if (width < 768) return 1; //mobile
    if (width < 1280) return 2; //tablet
    if (width < 1920) return 3; //desktop
    if (width < 2400) return 4; //ultra-wide
    return 5; // extreme
  };

  const [columnCount, setColumnCount] = useState(getColumnCount);

  useEffect(() => {
    // Update on resize
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columnCount;
}
