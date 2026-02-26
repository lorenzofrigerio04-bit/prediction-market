"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Allinea titolo e sottotitolo al centro */
  align?: "left" | "center";
}

export default function PageHeader({ title, description, action, align = "left" }: PageHeaderProps) {
  const isCenter = align === "center";
  return (
    <header className="mb-6 md:mb-8">
      <div
        className={`flex flex-col gap-2 sm:gap-4 ${isCenter ? "items-center text-center sm:flex-col" : "sm:flex-row sm:items-end sm:justify-between"}`}
      >
        <div className={isCenter ? "flex flex-col items-center" : "min-w-0"}>
          <h1 className="text-ds-h1 font-bold text-fg tracking-headline">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-ds-body-sm text-fg-muted tracking-title">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="shrink-0 mt-2 sm:mt-0">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
