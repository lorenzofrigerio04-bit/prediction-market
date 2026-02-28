"use client";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
}

export default function StreakBadge({ streak, size = "md" }: StreakBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Determina il colore in base allo streak
  const getStreakColor = (streak: number) => {
    if (streak === 0) return "bg-gray-200 text-gray-600";
    if (streak < 3) return "bg-orange-100 text-orange-700 border-orange-300";
    if (streak < 7) return "bg-orange-200 text-orange-800 border-orange-400";
    if (streak < 14) return "bg-red-200 text-red-800 border-red-400";
    return "bg-red-300 text-red-900 border-red-500";
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border-2 ${sizeClasses[size]} ${getStreakColor(
        streak
      )}`}
    >
      <span className={iconSizeClasses[size]}>🔥</span>
      <span>{streak} giorni</span>
    </span>
  );
}
