"use client";

import { ReactNode } from "react";
import CTAButton from "./CTAButton";

interface EmptyStateProps {
  title?: string;
  description: ReactNode;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export default function EmptyState({
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 md:py-16 rounded-2xl border border-border dark:border-white/10 glass max-w-lg mx-auto px-6 ${className}`}
    >
      {title && (
        <h3 className="text-ds-h2 font-bold text-fg mb-2">{title}</h3>
      )}
      <div className="text-ds-body text-fg-muted mb-4">{description}</div>
      {action && (
        <div className="mt-4">
          {action.href ? (
            <CTAButton href={action.href} variant="primary">
              {action.label}
            </CTAButton>
          ) : (
            <CTAButton
              variant="primary"
              onClick={action.onClick}
            >
              {action.label}
            </CTAButton>
          )}
        </div>
      )}
    </div>
  );
}
