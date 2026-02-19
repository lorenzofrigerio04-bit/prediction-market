"use client";

/**
 * Dynamic fluid background for pre-login landing (Stripe / Vibotech style).
 * Smooth-moving gradient orbs, platform colors, liquid depth.
 */
export default function LandingBackground() {
  return (
    <div className="landing-dynamic-bg" aria-hidden>
      {/* Base gradient layer */}
      <div className="landing-dynamic-bg__base" />
      {/* Animated orbs — different sizes, positions, durations for fluid mesh */}
      <div className="landing-dynamic-bg__orb landing-dynamic-bg__orb--1" />
      <div className="landing-dynamic-bg__orb landing-dynamic-bg__orb--2" />
      <div className="landing-dynamic-bg__orb landing-dynamic-bg__orb--3" />
      <div className="landing-dynamic-bg__orb landing-dynamic-bg__orb--4" />
      <div className="landing-dynamic-bg__orb landing-dynamic-bg__orb--5" />
      <div className="landing-dynamic-bg__orb landing-dynamic-bg__orb--6" />
      {/* Subtle grid overlay for tech / depth */}
      <div className="landing-dynamic-bg__grid" />
      {/* Vignette + gradient overlay for readability */}
      <div className="landing-dynamic-bg__overlay" />
    </div>
  );
}
