"use client";

interface DividerProps {
  className?: string;
}

export default function Divider({ className = "" }: DividerProps) {
  return (
    <hr
      className={`border-0 h-px bg-border dark:bg-white/10 my-0 ${className}`}
      aria-hidden
    />
  );
}
