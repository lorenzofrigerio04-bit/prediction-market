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
    "rounded-2xl transition-colors duration-ds-normal ease-ds-ease " +
    (elevated
      ? "glass-elevated border-2 border-primary/20"
      : "glass border border-border dark:border-white/10");

  return (
    <Component className={`${base} ${className}`}>
      {children}
    </Component>
  );
}
