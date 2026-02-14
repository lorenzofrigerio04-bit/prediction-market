"use client";

const PHRASES = [
  "Prevedi il futuro",
  "Eventi in tempo reale",
  "Crediti virtuali",
  "Nessun rischio",
  "Sali in classifica",
  "Dimostra di capire il mondo",
  "Previsioni sociali",
  "Risoluzione trasparente",
];

export default function HeroMarquee() {
  const duplicated = [...PHRASES, ...PHRASES];
  return (
    <div className="relative w-full overflow-hidden py-3 md:py-4 border-y border-white/10 dark:border-white/5">
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {duplicated.map((phrase, i) => (
          <span
            key={`${phrase}-${i}`}
            className="mx-6 text-2xl md:text-3xl lg:text-4xl font-bold text-fg/90 tracking-tight"
          >
            {phrase}
          </span>
        ))}
      </div>
    </div>
  );
}
