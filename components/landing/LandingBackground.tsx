"use client";

/**
 * Luxury mesh gradient background (Stripe / Apple style).
 * Single animated conic gradient — vector-based, no pixelation, high quality.
 */
export default function LandingBackground() {
  return (
    <div className="landing-dynamic-bg" aria-hidden>
      <div className="landing-dynamic-bg__mesh" />
      <div className="landing-dynamic-bg__vignette" />
    </div>
  );
}
