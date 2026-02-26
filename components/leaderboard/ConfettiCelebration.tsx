"use client";

import { useMemo, useEffect } from "react";

/** Palette coerente con il design system: primary, accent, teal, success, toni neutri */
const PALETTE = [
  "#2563eb", "#3b82f6", "#6366f1", "#818cf8", "#4f46e5", /* primary / indigo */
  "#14b8a6", "#2dd4bf", "#0d9488", /* teal */
  "#16a34a", "#4ade80", "#22c55e", /* success green */
  "#f43f5e", "#fb7185", "#e11d48", /* rose / accent */
  "#dbeafe", "#bfdbfe", "#93c5fd", /* primary muted / light blue */
  "#94a3b8", "#cbd5e1", "#64748b", /* slate neutri */
  "#fde047", "#facc15", /* soft gold */
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  rotation: number;
  size: number;
  color: string;
  shape: "rect" | "circle" | "round";
}

interface ConfettiCelebrationProps {
  active: boolean;
  onComplete: () => void;
  durationMs?: number;
}

export default function ConfettiCelebration({
  active,
  onComplete,
  durationMs = 4000,
}: ConfettiCelebrationProps) {
  const pieces = useMemo(() => {
    if (!active) return [];
    const list: Piece[] = [];
    const count = 220;
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        left: randomBetween(-2, 102),
        delay: randomBetween(0, 1400),
        duration: randomBetween(durationMs * 0.8, durationMs * 1.2) / 1000,
        drift: randomBetween(-80, 80),
        rotation: randomBetween(360, 1080) * (Math.random() > 0.5 ? 1 : -1),
        size: randomBetween(4, 12),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        shape: ["rect", "circle", "round"][Math.floor(Math.random() * 3)] as Piece["shape"],
      });
    }
    return list;
  }, [active, durationMs]);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onComplete, durationMs + 1600);
    return () => clearTimeout(t);
  }, [active, durationMs, onComplete]);

  if (!active || pieces.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute will-change-transform"
          style={{
            backfaceVisibility: "hidden",
            left: `${p.left}%`,
            top: "-24px",
            width: p.shape === "rect" ? p.size * 1.4 : p.size,
            height: p.size,
            borderRadius:
              p.shape === "circle" ? "50%" : p.shape === "round" ? "4px" : "0",
            backgroundColor: p.color,
            boxShadow: "0 0 2px rgba(0,0,0,0.08)",
            ["--cf-drift" as string]: `${p.drift}px`,
            ["--cf-rot" as string]: `${p.rotation}deg`,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}
