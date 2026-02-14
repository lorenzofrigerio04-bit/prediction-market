"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  /** Optional icon (emoji or element) */
  icon?: string;
  /** Visual emphasis: default | primary | success | danger */
  variant?: "default" | "primary" | "success" | "danger";
  subtitle?: string;
  elevated?: boolean;
}

const variantClasses = {
  default: "text-fg",
  primary: "text-primary",
  success: "text-emerald-500 dark:text-emerald-400",
  danger: "text-red-500 dark:text-red-400",
};

export default function StatCard({
  label,
  value,
  icon,
  variant = "default",
  subtitle,
  elevated = false,
}: StatCardProps) {
  const cardClass = elevated
    ? "glass-elevated border-2 border-primary/20"
    : "glass border border-border dark:border-white/10";

  return (
    <div className={`${cardClass} rounded-2xl p-4 md:p-6`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-ds-caption font-semibold text-fg-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-xl md:text-2xl shrink-0" aria-hidden>{icon}</span>}
      </div>
      <p className={`text-xl md:text-3xl font-bold ${variantClasses[variant]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-ds-micro text-fg-muted mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
