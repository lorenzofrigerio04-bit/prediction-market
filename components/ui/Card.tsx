"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** Elevated = glass-elevated + border primary */
  elevated?: boolean;
  /** Futuristic LED/neon/glass style */
  neon?: boolean;
  className?: string;
  as?: "div" | "article" | "section";
}

export default function Card({
  children,
  elevated = false,
  neon = false,
  className = "",
  as: Component = "div",
}: CardProps) {
  const base = neon
    ? "rounded-3xl transition-all duration-ds-normal ease-ds-ease " +
      (elevated ? "card-neon-glass" : "box-neon-soft hover:shadow-[0_0_28px_-8px_rgba(var(--primary-glow),0.18)]")
    : "rounded-3xl transition-all duration-ds-normal ease-ds-ease " +
      (elevated
        ? "glass-elevated border-2 border-primary/20"
        : "glass border border-border dark:border-white/10 " +
          "hover:border-primary/20 hover:shadow-glow-sm");

  return (
    <Component className={`${base} ${className}`}>
      {children}
    </Component>
  );
}
