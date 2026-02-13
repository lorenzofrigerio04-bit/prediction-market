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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
