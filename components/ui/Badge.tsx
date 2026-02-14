"use client";

type BadgeVariant = "trending" | "scadenza" | "nuovo" | "hot" | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  trending:
    "bg-primary/15 text-primary border border-primary/25 dark:bg-primary/20 dark:border-primary/30",
  scadenza:
    "bg-warning-bg/90 text-warning border border-warning/30 dark:bg-warning-bg/50 dark:text-warning dark:border-warning/40",
  nuovo:
    "bg-success-bg/90 text-success border border-success/30 dark:bg-success-bg/50 dark:text-success dark:border-success/40",
  hot:
    "bg-danger-bg/90 text-danger border border-danger/30 dark:bg-danger-bg/50 dark:text-danger dark:border-danger/40",
  default:
    "bg-surface/80 text-text-secondary border border-border dark:border-white/10 dark:bg-surface/80",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center shrink-0 px-2.5 py-1 rounded-xl text-ds-micro font-bold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
