"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Replays a soft entrance animation on every route change by re-keying on the
 * pathname. Wraps the content area in each layout so navigating between pages
 * (user site and admin) feels like a smooth transition instead of a hard swap.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page">
      {children}
    </div>
  );
}
