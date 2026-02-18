"use client";

type BadgeVariant = "trending" | "scadenza" | "nuovo" | "hot" | "open" | "closed" | "resolved" | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  trending:
    "bg-primary/20 text-primary border border-primary/30",
  scadenza:
    "bg-warning-bg/50 text-warning border border-warning/40",
  nuovo:
    "bg-success-bg/50 text-success border border-success/40",
  hot:
    "bg-danger-bg/50 text-danger border border-danger/40",
  open:
    "bg-success-bg/50 text-success border border-success/40",
  closed:
    "bg-white/10 text-fg-muted border border-white/10",
  resolved:
    "bg-primary/15 text-primary border border-primary/25",
  default:
    "bg-white/10 text-fg-muted border border-white/10",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center shrink-0 px-2.5 py-1 rounded-lg text-ds-micro font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
