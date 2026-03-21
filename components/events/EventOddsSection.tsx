/**
 * Sezione quote: "Questo evento è presente su [piattaforma]: quote SÌ X, NO Y".
 * Usa i campi salvati (bestBookmakerTitle, bestYesOdds, bestNoOdds) per eventi ODDS_API.
 */

export interface EventOddsSectionProps {
  bestBookmakerTitle: string | null;
  bestYesOdds: number | null;
  bestNoOdds: number | null;
  className?: string;
}

export function EventOddsSection({
  bestBookmakerTitle,
  bestYesOdds,
  bestNoOdds,
  className = "",
}: EventOddsSectionProps) {
  if (
    !bestBookmakerTitle?.trim() ||
    bestYesOdds == null ||
    bestNoOdds == null
  ) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-fg-muted/20 bg-fg-muted/5 px-4 py-3 text-ds-body-sm ${className}`}
      role="region"
      aria-label="Quote bookmaker"
    >
      <p className="text-fg">
        Questo evento è presente su{" "}
        <span className="font-semibold">{bestBookmakerTitle}</span>
        {": "}
        quote SÌ{" "}
        <span className="font-semibold text-primary">
          {bestYesOdds.toFixed(2)}
        </span>
        {", "}
        NO{" "}
        <span className="font-semibold text-primary">
          {bestNoOdds.toFixed(2)}
        </span>
      </p>
    </div>
  );
}
