"use client";

const LINES = [
  "Prevedi il futuro.",
  "Guadagna crediti.",
  "Scala la classifica.",
];

export default function LandingHeroTitle() {
  return (
    <h1
      className="landing-hero-title landing-hero-title--lines text-ds-display-landing my-2 md:my-3 max-w-2xl mx-auto leading-tight tracking-tight text-center"
      aria-label={LINES.join(" ")}
    >
      {LINES.map((line, i) => (
        <span key={i} className="landing-hero-title__line block">
          {line}
        </span>
      ))}
    </h1>
  );
}
