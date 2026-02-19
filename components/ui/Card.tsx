"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** Elevated = stronger shadow on hover */
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
    "rounded-3xl transition-all duration-ds-normal ease-ds-ease " +
    (elevated
      ? "card-raised hover-lift shadow-card hover:shadow-card-hover"
      : "card-raised hover-lift");

  return (
    <Component className={`${base} ${className}`}>
      {children}
    </Component>
  );
}
