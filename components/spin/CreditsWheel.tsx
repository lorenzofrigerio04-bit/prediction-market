"use client";

import { useState, useCallback, useMemo } from "react";
import {
  CREDITS_WHEEL_SEGMENTS,
  CREDITS_SEGMENT_COUNT,
} from "@/lib/spin-config";

const SEGMENT_ANGLE = 360 / CREDITS_SEGMENT_COUNT;
const FULL_TURNS = 5;
const SPIN_DURATION_MS = 4800;
const EASING = "cubic-bezier(0.22, 0.61, 0.36, 1)";

const SEGMENT_COLORS = [
  { from: "#1e293b", to: "#334155", glow: "#475569" },
  { from: "#0f172a", to: "#1e293b", glow: "#3b82f6" },
  { from: "#1e3a5f", to: "#1e293b", glow: "#60a5fa" },
  { from: "#1e293b", to: "#334155", glow: "#64748b" },
  { from: "#1e3a5f", to: "#1e293b", glow: "#60a5fa" },
  { from: "#334155", to: "#475569", glow: "#64748b" },
  { from: "#1e3a5f", to: "#2563eb", glow: "#3b82f6" },
  { from: "#334155", to: "#475569", glow: "#94a3b8" },
];

function getSegmentPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  const start = (startDeg * Math.PI) / 180;
  const end = (endDeg * Math.PI) / 180;
  const x1 = cx + r * Math.sin(start);
  const y1 = cy - r * Math.cos(start);
  const x2 = cx + r * Math.sin(end);
  const y2 = cy - r * Math.cos(end);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export interface CreditsWheelResult {
  credits: number;
  segmentIndex: number;
}

interface CreditsWheelProps {
  canSpin: boolean;
  onSpin: () => Promise<CreditsWheelResult>;
  onSuccess?: (result: CreditsWheelResult) => void;
  disabled?: boolean;
}

export default function CreditsWheel({
  canSpin,
  onSpin,
  onSuccess,
  disabled = false,
}: CreditsWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handleSpin = useCallback(async () => {
    if (!canSpin || spinning || disabled) return;

    setSpinning(true);
    setResult(null);

    try {
      const res = await onSpin();
      const segmentIndex =
        res.segmentIndex >= 0 && res.segmentIndex < CREDITS_SEGMENT_COUNT
          ? res.segmentIndex
          : 0;

      const segmentCenter = segmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
      const finalAngle = FULL_TURNS * 360 + (360 - segmentCenter);

      setRotation((prev) => prev + finalAngle);

      await new Promise((r) => setTimeout(r, SPIN_DURATION_MS + 300));

      setResult(res.credits);
      onSuccess?.(res);
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
  const labelR = r * 0.65;

  const segments = useMemo(() => {
    return CREDITS_WHEEL_SEGMENTS.map((seg, i) => {
      const startDeg = i * SEGMENT_ANGLE;
      const endDeg = (i + 1) * SEGMENT_ANGLE;
      const midDeg = startDeg + SEGMENT_ANGLE / 2;
      const rad = (midDeg * Math.PI) / 180;
      const lx = cx + labelR * Math.sin(rad);
      const ly = cy - labelR * Math.cos(rad);
      return {
        path: getSegmentPath(cx, cy, r, startDeg, endDeg),
        color: SEGMENT_COLORS[i] ?? SEGMENT_COLORS[0],
        label: seg.label,
        labelX: lx,
        labelY: ly,
        labelRotate: midDeg,
      };
    });
  }, [cx, cy, r, labelR]);

  return (
    <div className="credits-wheel">
      <h2 className="credits-wheel__title">Spin del giorno</h2>
      <p className="credits-wheel__subtitle">
        Un giro al giorno. Vinci fino a 500 crediti.
      </p>

      <div
        className={`credits-wheel__wrap ${spinning ? "credits-wheel__wrap--spinning" : ""}`}
        style={{ width: size, height: size }}
      >
        <div className="credits-wheel__pointer" aria-hidden />
        <div
          className="credits-wheel__wheel"
          style={{
            width: size,
            height: size,
            transition: spinning
              ? `transform ${SPIN_DURATION_MS}ms ${EASING}`
              : "transform 0.5s ease-out",
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="credits-wheel__svg"
          >
            <defs>
              {segments.map((seg, i) => {
                const midRad = (seg.labelRotate * Math.PI) / 180;
                const x2 = cx + r * Math.sin(midRad);
                const y2 = cy - r * Math.cos(midRad);
                return (
                  <linearGradient
                    key={i}
                    id={`credits-grad-${i}`}
                    x1={cx}
                    y1={cy}
                    x2={x2}
                    y2={y2}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor={seg.color.from} stopOpacity="0.95" />
                    <stop offset="100%" stopColor={seg.color.to} stopOpacity="0.85" />
                  </linearGradient>
                );
              })}
            </defs>
            <g className="credits-wheel__segments">
              {segments.map((seg, i) => (
                <g key={i}>
                  <path
                    d={seg.path}
                    fill={`url(#credits-grad-${i})`}
                    className="credits-wheel__segment"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={seg.labelX}
                    y={seg.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="credits-wheel__label"
                    transform={`rotate(${seg.labelRotate}, ${seg.labelX}, ${seg.labelY})`}
                  >
                    {seg.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
        <div className={`credits-wheel__core ${spinning ? "credits-wheel__core--active" : ""}`} aria-hidden />
      </div>

      {result !== null && result === 0 && (
        <p className="credits-wheel__zero" role="status">
          Nessun credito questa volta. Torna domani.
        </p>
      )}

      <button
        type="button"
        onClick={handleSpin}
        disabled={!canSpin || spinning || disabled}
        className="credits-wheel__cta"
      >
        {spinning ? (
          <span className="credits-wheel__cta-inner">
            <span className="credits-wheel__spinner" aria-hidden />
            In corso...
          </span>
        ) : canSpin ? (
          "Gira la ruota"
        ) : (
          "Già usato oggi"
        )}
      </button>
    </div>
  );
}
