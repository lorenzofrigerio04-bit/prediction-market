"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: "blue" | "green" | "orange" | "purple" | "red";
  subtitle?: string;
}

const colorClasses = {
  blue: "text-blue-600",
  green: "text-green-600",
  orange: "text-orange-600",
  purple: "text-purple-600",
  red: "text-red-600",
};

export default function StatsCard({
  title,
  value,
  icon,
  color = "blue",
  subtitle,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
        {icon && <span className="text-xl md:text-2xl">{icon}</span>}
      </div>
      <p className={`text-xl md:text-3xl font-bold ${colorClasses[color]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
