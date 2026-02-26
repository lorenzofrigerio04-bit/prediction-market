"use client";

/** Sfera di cristallo senza messaggi: solo la palla che balla (fluttuazione + luccichio). Per Fase 2. */
export default function CrystalBallOnly() {
  return (
    <div className="crystal-ball-block flex flex-col items-center shrink-0" aria-hidden>
      <div className="crystal-ball">
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
