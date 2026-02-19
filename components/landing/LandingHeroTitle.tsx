"use client";

const TITLE_TEXT = "Prevedi il futuro. Guadagna crediti. Scala la classifica.";
const WORDS = TITLE_TEXT.split(/\s+/);
const WORD_DURATION_MS = 420;
const STAGGER_MS = 65;

export default function LandingHeroTitle() {
  return (
    <h1
      className="landing-hero-title landing-hero-title--typewriter text-ds-display-landing my-3 md:my-4 max-w-2xl mx-auto leading-tight tracking-tight"
      aria-label={TITLE_TEXT}
    >
      {WORDS.map((word, i) => (
        <span
          key={i}
          className="landing-hero-title__word inline-block"
          style={{
            animationDelay: `${i * STAGGER_MS}ms`,
            animationDuration: `${WORD_DURATION_MS}ms`,
          }}
        >
          {word}
          {i < WORDS.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </h1>
  );
}
