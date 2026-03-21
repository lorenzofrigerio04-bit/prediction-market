"use client";

export const MODAL_QUOTE_TIMER_DURATION = 100;

type Props = {
  secondsLeft: number;
  className?: string;
  /** `sell`: include hint su Annulla (modal vendita). */
  variant?: "sell" | "default";
};

export default function ModalQuoteTimer({ secondsLeft, className, variant = "default" }: Props) {
  const size = 52;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(MODAL_QUOTE_TIMER_DURATION, secondsLeft));
  const progress = clamped / MODAL_QUOTE_TIMER_DURATION;
  const offset = circumference * (1 - progress);

  const ariaLabel =
    variant === "sell"
      ? `Aggiornamento stima tra ${clamped} secondi. Per chiudere usa il pulsante Annulla.`
      : `Aggiornamento stima tra ${clamped} secondi.`;

  return (
    <div
      className={`relative shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
      role="timer"
      aria-label={ariaLabel}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          className="stroke-white/12"
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          className="stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-chubby text-sm font-bold tabular-nums text-fg">
        {clamped}
      </span>
    </div>
  );
}
