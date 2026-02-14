"use client";

type BadgeVariant = "trending" | "scadenza" | "nuovo" | "hot" | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  trending:
    "bg-primary/20 text-primary dark:bg-primary/25 dark:text-primary border border-primary/30",
  scadenza:
    "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  nuovo:
    "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
  hot:
    "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30",
  default:
    "bg-surface/50 text-fg-muted border border-border dark:border-white/10",
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
