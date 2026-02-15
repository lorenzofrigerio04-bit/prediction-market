"use client";

import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  /** Optional icon (React node, e.g. from Icons) */
  icon?: ReactNode;
  /** Visual emphasis: default | primary | success | danger */
  variant?: "default" | "primary" | "success" | "danger";
  subtitle?: string;
  elevated?: boolean;
  /** Futuristic LED/neon style */
  neon?: boolean;
}

const variantClasses = {
  default: "text-fg",
  primary: "text-primary",
  success: "text-success",
  danger: "text-danger",
};

export default function StatCard({
  label,
  value,
  icon,
  variant = "default",
  subtitle,
  elevated = false,
  neon = false,
}: StatCardProps) {
  const cardClass = neon
    ? "stat-neon-mini"
    : elevated
      ? "glass-elevated border-2 border-primary/20"
      : "glass border border-border dark:border-white/10";

  return (
    <div className={`${cardClass} rounded-2xl md:rounded-2.5xl p-4 md:p-6`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-ds-label font-semibold text-fg-muted uppercase tracking-label">
          {label}
        </span>
        {icon && <span className="shrink-0 [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6 text-fg-muted" aria-hidden>{icon}</span>}
      </div>
      <p className={`text-xl md:text-3xl font-bold font-numeric ${variantClasses[variant]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-ds-micro text-fg-muted mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
