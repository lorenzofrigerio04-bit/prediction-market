"use client";

interface DividerProps {
  className?: string;
}

export default function Divider({ className = "" }: DividerProps) {
  return (
    <hr
      className={`border-0 h-px bg-divider my-0 ${className}`}
      aria-hidden
    />
  );
}
