"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** Elevated = glass-elevated + border primary */
  elevated?: boolean;
  className?: string;
  as?: "div" | "article" | "section";
}

export default function Card({
  children,
  elevated = false,
  className = "",
  as: Component = "div",
}: CardProps) {
  const base =
    "rounded-2xl md:rounded-2.5xl transition-all duration-ds-normal ease-ds-ease " +
    (elevated
      ? "glass-elevated border-2 border-primary/20"
      : "glass border border-border dark:border-white/10 " +
        "hover:border-primary/15 hover:shadow-card-hover");

  return (
    <Component className={`${base} ${className}`}>
      {children}
    </Component>
  );
}
