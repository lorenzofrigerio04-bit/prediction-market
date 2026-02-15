"use client";

import { useState, useCallback, useMemo } from "react";
import {
  MULTIPLIER_WHEEL_SEGMENTS,
  MULTIPLIER_SEGMENT_COUNT,
} from "@/lib/spin-config";

const SEGMENT_ANGLE = 360 / MULTIPLIER_SEGMENT_COUNT;
const FULL_TURNS = 6;
const SPIN_DURATION_MS = 5600;
const EASING = "cubic-bezier(0.16, 0.84, 0.44, 1)";

/** Palette premium: oro/ambra, viola scuro, sensazione esclusiva */
const MULTIPLIER_COLORS = [
  { from: "#292524", to: "#44403c", glow: "#78716c" },
  { from: "#422006", to: "#713f12", glow: "#b45309" },
  { from: "#1c1917", to: "#292524", glow: "#57534e" },
  { from: "#451a03", to: "#78350f", glow: "#ea580c" },
  { from: "#431407", to: "#9a3412", glow: "#f97316" },
  { from: "#4c1d95", to: "#5b21b6", glow: "#a78bfa" },
  { from: "#581c87", to: "#7e22ce", glow: "#c084fc" },
  { from: "#701a75", to: "#86198f", glow: "#e879f9" },
  { from: "#134e4a", to: "#0f766e", glow: "#2dd4bf" },
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

export interface MultiplierWheelResult {
  multiplier: number;
  baseCredits: number;
  totalCredits: number;
  segmentIndex: number;
}

interface MultiplierWheelProps {
  baseCredits: number;
  onSpin: () => Promise<MultiplierWheelResult>;
  onSuccess?: (result: MultiplierWheelResult) => void;
  onClose?: () => void;
}

export default function MultiplierWheel({
  baseCredits,
  onSpin,
  onSuccess,
  onClose,
}: MultiplierWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<MultiplierWheelResult | null>(null);

  const handleSpin = useCallback(async () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    try {
      const res = await onSpin();
      const segmentIndex =
        res.segmentIndex >= 0 && res.segmentIndex < MULTIPLIER_SEGMENT_COUNT
          ? res.segmentIndex
          : 0;

      const segmentCenter = segmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
      const finalAngle = FULL_TURNS * 360 + (360 - segmentCenter);

      setRotation((prev) => prev + finalAngle);

      await new Promise((r) => setTimeout(r, SPIN_DURATION_MS + 400));

      setResult(res);
      onSuccess?.(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSpinning(false);
    }
  }, [spinning, onSpin, onSuccess]);

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 24;
  const labelR = r * 0.62;

  const segments = useMemo(() => {
    return MULTIPLIER_WHEEL_SEGMENTS.map((seg, i) => {
      const startDeg = i * SEGMENT_ANGLE;
      const endDeg = (i + 1) * SEGMENT_ANGLE;
      const midDeg = startDeg + SEGMENT_ANGLE / 2;
      const rad = (midDeg * Math.PI) / 180;
      const lx = cx + labelR * Math.sin(rad);
      const ly = cy - labelR * Math.cos(rad);
      const color = MULTIPLIER_COLORS[i] ?? MULTIPLIER_COLORS[0];
      return {
        path: getSegmentPath(cx, cy, r, startDeg, endDeg),
        color,
        label: seg.label,
        labelX: lx,
        labelY: ly,
        labelRotate: midDeg,
      };
    });
  }, [cx, cy, r, labelR]);

  return (
    <div className="multiplier-wheel">
      <h2 className="multiplier-wheel__title">Ruota moltiplicatrice</h2>
      <p className="multiplier-wheel__subtitle">
        I tuoi <strong>{baseCredits} crediti</strong> possono diventare fino a{" "}
        <strong>{baseCredits * 100}</strong>
      </p>

      <div
        className={`multiplier-wheel__wrap ${spinning ? "multiplier-wheel__wrap--spinning" : ""}`}
        style={{ width: size, height: size }}
      >
        <div className="multiplier-wheel__pointer" aria-hidden />
        <div
          className="multiplier-wheel__wheel"
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
            className="multiplier-wheel__svg"
          >
            <defs>
              {segments.map((seg, i) => {
                const midRad = (seg.labelRotate * Math.PI) / 180;
                const x2 = cx + r * Math.sin(midRad);
                const y2 = cy - r * Math.cos(midRad);
                return (
                  <linearGradient
                    key={i}
                    id={`mult-grad-${i}`}
                    x1={cx}
                    y1={cy}
                    x2={x2}
                    y2={y2}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor={seg.color.from} stopOpacity="0.95" />
                    <stop offset="100%" stopColor={seg.color.to} stopOpacity="0.9" />
                  </linearGradient>
                );
              })}
            </defs>
            <g className="multiplier-wheel__segments">
              {segments.map((seg, i) => (
                <g key={i}>
                  <path
                    d={seg.path}
                    fill={`url(#mult-grad-${i})`}
                    className="multiplier-wheel__segment"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={seg.labelX}
                    y={seg.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="multiplier-wheel__label"
                    transform={`rotate(${seg.labelRotate}, ${seg.labelX}, ${seg.labelY})`}
                  >
                    {seg.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
        <div className={`multiplier-wheel__core ${spinning ? "multiplier-wheel__core--active" : ""}`} aria-hidden />
      </div>

      {!result && (
        <button
          type="button"
          onClick={handleSpin}
          disabled={spinning}
          className="multiplier-wheel__cta"
        >
          {spinning ? (
            <span className="multiplier-wheel__cta-inner">
              <span className="multiplier-wheel__spinner" aria-hidden />
              In corso...
            </span>
          ) : (
            "Gira la ruota"
          )}
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="multiplier-wheel__back"
          aria-label="Indietro"
        >
          Indietro
        </button>
      )}
    </div>
  );
}
