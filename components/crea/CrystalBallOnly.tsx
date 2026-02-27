"use client";

/** Sfera di cristallo. Opzionalmente mostra un solo messaggio sopra la palla (es. "Complimenti! Il tuo evento è creato"). */
export default function CrystalBallOnly({ message }: { message?: string }) {
  return (
    <div className="crystal-ball-block flex flex-col items-center gap-4 shrink-0">
      {message != null && message !== "" && (
        <div className="crystal-ball-bubbles crystal-ball-bubbles--congrats flex flex-col items-center gap-2">
          <div
            className="crystal-ball-bubble crystal-ball-bubble--complete crystal-ball-bubble--has-tail"
            role="status"
            aria-live="polite"
            aria-label={message}
          >
            <span className="crystal-ball-bubble-text">{message}</span>
            <span className="crystal-ball-bubble-tail" aria-hidden />
          </div>
        </div>
      )}
      <div className="crystal-ball" aria-hidden>
        <div className="crystal-ball-inner">
          <div className="crystal-ball-shine" />
          <div className="crystal-ball-glow" />
          <div className="crystal-ball-sparkle crystal-ball-sparkle--1" />
          <div className="crystal-ball-sparkle crystal-ball-sparkle--2" />
          <div className="crystal-ball-sparkle crystal-ball-sparkle--3" />
        </div>
      </div>
    </div>
  );
}
