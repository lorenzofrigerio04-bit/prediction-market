"use client";

import { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  /** Optional section title (h2) */
  title?: string;
  /** Optional link or action next to title */
  action?: ReactNode;
  className?: string;
}

export default function SectionContainer({
  children,
  title,
  action,
  className = "",
}: SectionContainerProps) {
  return (
    <section className={`mb-section md:mb-section-lg ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          {title && (
            <h2 className="text-ds-h2 font-bold text-fg">
              {title}
            </h2>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
