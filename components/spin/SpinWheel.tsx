"use client";

import { useState, useCallback } from "react";
import { SPIN_WEIGHTED_REWARDS, SPIN_SEGMENT_COUNT } from "@/lib/spin-config";

const SEGMENT_ANGLE = 360 / SPIN_SEGMENT_COUNT;
const FULL_TURNS = 6;
const SPIN_DURATION_MS = 5000;
const EASING = "cubic-bezier(0.12, 0.8, 0.2, 1)";

interface SpinWheelProps {
  canSpin: boolean;
  onSpin: () => Promise<{
    rewardIndex: number;
    reward: {
      label: string;
      kind: string;
      amount?: number;
      multiplier?: number;
      durationMinutes?: number;
    };
  }>;
  onSuccess?: (result: { newCredits: number; reward: { label: string; kind: string } }) => void;
  disabled?: boolean;
}

const SEGMENT_COLORS = [
  "rgb(var(--primary) / 0.25)",
  "rgb(var(--primary) / 0.4)",
  "rgb(var(--primary) / 0.25)",
  "rgb(var(--primary) / 0.4)",
  "rgb(var(--primary) / 0.25)",
  "rgb(var(--primary) / 0.4)",
];

const conicGradient = SEGMENT_COLORS.slice(0, SPIN_SEGMENT_COUNT)
  .map((c, i) => `${c} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`)
  .join(", ");

export default function SpinWheel({
  canSpin,
  onSpin,
  onSuccess,
  disabled = false,
}: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{
    label: string;
    kind: string;
  } | null>(null);

  const handleSpin = useCallback(async () => {
    if (!canSpin || spinning || disabled) return;

    setSpinning(true);
    setResult(null);

    try {
      const res = await onSpin();
      const rewardIndex = res.rewardIndex;
      const reward = res.reward;

      const finalAngle = 360 * FULL_TURNS + (360 - rewardIndex * SEGMENT_ANGLE);

      setRotation((prev) => prev + finalAngle);

      await new Promise((r) => setTimeout(r, SPIN_DURATION_MS + 300));

      setResult({ label: reward.label, kind: reward.kind });
      onSuccess?.({ newCredits: 0, reward: { label: reward.label, kind: reward.kind } });
    } catch (e) {
      console.error(e);
    } finally {
      setSpinning(false);
    }
  }, [canSpin, spinning, disabled, onSpin, onSuccess]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative" style={{ width: 300, height: 300 }}>
        {/* Pointer in alto */}
        <div
          className="absolute left-1/2 -top-1 z-10 -translate-x-1/2 rounded-full border-4 border-primary bg-primary px-3 py-1.5 shadow-glow-sm"
          aria-hidden
        >
          <span className="text-sm font-bold text-white">▼</span>
        </div>

        {/* Ruota con conic-gradient + bordo */}
        <div
          className="absolute inset-0 rounded-full border-4 border-primary/40 shadow-card"
          style={{ background: "rgb(var(--surface) / 0.9)" }}
        >
          <div
            className="absolute inset-2 rounded-full overflow-hidden"
            style={{
              background: `conic-gradient(${conicGradient})`,
              transition: `transform ${SPIN_DURATION_MS}ms ${EASING}`,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* Etichette sui segmenti: posizionate al centro di ogni slice */}
            {SPIN_WEIGHTED_REWARDS.map((r, i) => {
              const angleDeg = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
              const rad = (angleDeg * Math.PI) / 180;
              const rPercent = 62;
              const x = 50 + rPercent * Math.sin(rad);
              const y = 50 - rPercent * Math.cos(rad);
              return (
                <div
                  key={i}
                  className="absolute flex items-center justify-center text-center"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
                    width: "28%",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "rgb(var(--fg))",
                    textShadow: "0 0 8px rgb(var(--surface))",
                  }}
                >
                  {r.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Centro ruota */}
        <div
          className="absolute left-1/2 top-1/2 z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-primary bg-surface shadow-card"
          aria-hidden
        />
      </div>

      {result && (
        <div
          className="rounded-2xl border-2 border-primary bg-primary/10 px-6 py-4 text-center"
          role="alert"
        >
          <p className="text-ds-body font-bold text-fg">Hai vinto!</p>
          <p className="mt-1 text-ds-h3 font-bold text-primary">{result.label}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleSpin}
        disabled={!canSpin || spinning || disabled}
        className="min-h-[48px] rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-glow-sm transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        {spinning ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
            Gira...
          </span>
        ) : canSpin ? (
          "Gira la ruota"
        ) : (
          "Spin già usato oggi"
        )}
      </button>
    </div>
  );
}
