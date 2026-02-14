"use client";

import { useState, useCallback, useMemo } from "react";
import { SPIN_WEIGHTED_REWARDS, SPIN_SEGMENT_COUNT } from "@/lib/spin-config";

const SEGMENT_COUNT = SPIN_SEGMENT_COUNT;
const WHEEL_MULTIPLIERS = SPIN_WEIGHTED_REWARDS.map((r) => r.reward.multiplier);
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;
const FULL_TURNS = 6;
const SPIN_DURATION_MS = 5200;
const EASING = "cubic-bezier(0.12, 0.8, 0.2, 1)";

/** Colori LED per segmenti: bassi → blu/cyan, medi → viola/indaco, alti → arancio/rosso soft */
const SEGMENT_GRADIENTS = [
  { from: "#0ea5e9", to: "#06b6d4", glow: "#22d3ee" },   // x1.2 - cyan
  { from: "#06b6d4", to: "#0ea5e9", glow: "#67e8f9" },   // x1.5 - cyan/blue
  { from: "#3b82f6", to: "#6366f1", glow: "#818cf8" },   // x2 - blue/indigo
  { from: "#6366f1", to: "#8b5cf6", glow: "#a78bfa" },   // x2.5 - indigo/violet
  { from: "#8b5cf6", to: "#a855f7", glow: "#c084fc" },   // x3 - violet
  { from: "#f97316", to: "#ea580c", glow: "#fb923c" },   // x4 - orange
  { from: "#ef4444", to: "#f97316", glow: "#f87171" },   // x5 - red/orange
];

export interface SpinWheelResult {
  rewardIndex: number;
  reward: {
    label: string;
    kind: string;
    multiplier?: number;
    amount?: number;
    durationMinutes?: number;
  };
}

interface SpinWheelProps {
  canSpin: boolean;
  onSpin: () => Promise<SpinWheelResult>;
  onSuccess?: (result: { newCredits?: number; reward: { label: string; kind: string; multiplier?: number } }) => void;
  disabled?: boolean;
}

function getSegmentPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = (startDeg * Math.PI) / 180;
  const end = (endDeg * Math.PI) / 180;
  const x1 = cx + r * Math.sin(start);
  const y1 = cy - r * Math.cos(start);
  const x2 = cx + r * Math.sin(end);
  const y2 = cy - r * Math.cos(end);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export default function SpinWheel({
  canSpin,
  onSpin,
  onSuccess,
  disabled = false,
}: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ multiplier: number; label: string } | null>(null);
  const [resultPulse, setResultPulse] = useState(false);

  const handleSpin = useCallback(async () => {
    if (!canSpin || spinning || disabled) return;

    setSpinning(true);
    setResult(null);
    setResultPulse(false);

    try {
      const res = await onSpin();
      const rewardIndex = res.rewardIndex >= 0 && res.rewardIndex < SEGMENT_COUNT
        ? res.rewardIndex
        : Math.floor(Math.random() * SEGMENT_COUNT);
      const multiplier = res.reward.multiplier ?? WHEEL_MULTIPLIERS[rewardIndex];

      // La ruota ha il pointer in alto: il segmento "vincente" deve finire in alto.
      // Segmento i è tra angle i*SEGMENT_ANGLE e (i+1)*SEGMENT_ANGLE (in senso orario dalla destra).
      // Per far apparire il segmento rewardIndex in alto (12h) servono:
      // rotation finale = FULL_TURNS*360 + (360 - (rewardIndex * SEGMENT_ANGLE + SEGMENT_ANGLE/2))
      const segmentCenter = rewardIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
      const finalAngle = FULL_TURNS * 360 + (360 - segmentCenter);

      setRotation((prev) => prev + finalAngle);

      await new Promise((r) => setTimeout(r, SPIN_DURATION_MS + 400));

      setResult({ multiplier, label: res.reward.label });
      setResultPulse(true);
      onSuccess?.({
        newCredits: 0,
        reward: { label: res.reward.label, kind: res.reward.kind, multiplier },
      });

      setTimeout(() => setResultPulse(false), 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setSpinning(false);
    }
  }, [canSpin, spinning, disabled, onSpin, onSuccess]);

  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;
  const labelR = r * 0.62;

  const segments = useMemo(() => {
    return Array.from({ length: SEGMENT_COUNT }, (_, i) => {
      const startDeg = i * SEGMENT_ANGLE;
      const endDeg = (i + 1) * SEGMENT_ANGLE;
      const midDeg = startDeg + SEGMENT_ANGLE / 2;
      const rad = (midDeg * Math.PI) / 180;
      const lx = cx + labelR * Math.sin(rad);
      const ly = cy - labelR * Math.cos(rad);
      return {
        path: getSegmentPath(cx, cy, r, startDeg, endDeg),
        gradient: SEGMENT_GRADIENTS[i],
        label: `x${WHEEL_MULTIPLIERS[i]}`,
        labelX: lx,
        labelY: ly,
        labelRotate: midDeg,
      };
    });
  }, [cx, cy, r, labelR]);

  return (
    <div className="spin-of-the-day">
      <h2 className="spin-of-the-day__title">Spin of the Day</h2>
      <p className="spin-of-the-day__subtitle">
        Un giro al giorno. Bonus moltiplicatore garantito.
      </p>

      <div
        className={`spin-of-the-day__wheel-wrap ${spinning ? "is-spinning" : ""} ${resultPulse ? "result-pulse" : ""}`}
        style={{ width: size, height: size }}
      >
        {/* Pointer in alto: triangolo futuristico con glow */}
        <div className="spin-of-the-day__pointer" aria-hidden>
          <span className="spin-of-the-day__pointer-inner" />
        </div>

        <div
          className="spin-of-the-day__wheel"
          style={{
            width: size,
            height: size,
            transition: spinning ? `transform ${SPIN_DURATION_MS}ms ${EASING}` : "transform 0.6s ease",
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="spin-of-the-day__svg">
            <defs>
              {segments.map((seg, i) => {
                const midRad = (seg.labelRotate * Math.PI) / 180;
                const x2 = cx + r * Math.sin(midRad);
                const y2 = cy - r * Math.cos(midRad);
                return (
                  <linearGradient
                    key={i}
                    id={`segment-grad-${i}`}
                    x1={cx}
                    y1={cy}
                    x2={x2}
                    y2={y2}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor={SEGMENT_GRADIENTS[i].from} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={SEGMENT_GRADIENTS[i].to} stopOpacity="0.75" />
                  </linearGradient>
                );
              })}
              {segments.map((_, i) => (
                <filter key={`f-${i}`} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feFlood floodColor={SEGMENT_GRADIENTS[i].glow} floodOpacity="0.35" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>
            <g className="spin-of-the-day__segments">
              {segments.map((seg, i) => (
                <g key={i}>
                  <path
                    d={seg.path}
                    fill={`url(#segment-grad-${i})`}
                    filter={`url(#glow-${i})`}
                    className="spin-of-the-day__segment"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={seg.labelX}
                    y={seg.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="spin-of-the-day__segment-label"
                    transform={`rotate(${seg.labelRotate}, ${seg.labelX}, ${seg.labelY})`}
                  >
                    {seg.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Centro: core luminoso con pulse */}
        <div className={`spin-of-the-day__core ${spinning ? "core-active" : ""}`} aria-hidden />
      </div>

      {result && (
        <div className="spin-of-the-day__result" role="alert">
          <p className="spin-of-the-day__result-title">Hai ottenuto {result.label}</p>
          <p className="spin-of-the-day__result-sub">Moltiplicatore attivo per oggi</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleSpin}
        disabled={!canSpin || spinning || disabled}
        className="spin-of-the-day__cta"
      >
        {spinning ? (
          <span className="spin-of-the-day__cta-inner">
            <span className="spin-of-the-day__spinner" aria-hidden />
            Gira...
          </span>
        ) : canSpin ? (
          "BLOCCA MOLTIPLICATORE"
        ) : (
          "Spin già usato oggi"
        )}
      </button>
    </div>
  );
}
