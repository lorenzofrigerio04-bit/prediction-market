"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: "blue" | "green" | "orange" | "purple" | "red";
  subtitle?: string;
  elevated?: boolean;
}

const colorClasses = {
  blue: "text-primary",
  green: "text-emerald-500 dark:text-emerald-400",
  orange: "text-amber-500 dark:text-amber-400",
  purple: "text-violet-500 dark:text-violet-400",
  red: "text-red-500 dark:text-red-400",
};

export default function StatsCard({
  title,
  value,
  icon,
  color = "blue",
  subtitle,
  elevated = false,
}: StatsCardProps) {
  const base = elevated ? "stat-mini shadow-card" : "stat-mini";
  return (
    <div className={`${base} rounded-2xl p-4 md:p-6`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider">{title}</h3>
        {icon && <span className="text-xl md:text-2xl">{icon}</span>}
      </div>
      <p className={`text-xl md:text-3xl font-bold ${colorClasses[color]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-fg-muted mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
