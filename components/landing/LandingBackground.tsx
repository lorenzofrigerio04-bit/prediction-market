"use client";

/**
 * Silicon Valley / tech background: mesh solo ai bordi, centro pulito,
 * palette blu/slate/cyan, animazione fluida e percepibile.
 */
export default function LandingBackground() {
  return (
    <div className="landing-dynamic-bg" aria-hidden>
      <div className="landing-dynamic-bg__mesh" />
      <div className="landing-dynamic-bg__center-mask" />
      <div className="landing-dynamic-bg__vignette" />
    </div>
  );
}
