"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 md:mb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-ds-h1 font-bold text-fg tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-ds-body-sm text-fg-muted">
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
