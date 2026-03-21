import { getDisplayCredits } from "@/lib/credits-config";

export interface CreditsSource {
  credits: number;
  creditsMicros: bigint | null;
}

export interface CreditsReadModel {
  displayCredits: number;
  microsBalance: string | null;
}

export function toCreditsReadModel(source: CreditsSource): CreditsReadModel {
  return {
    displayCredits: getDisplayCredits({
      credits: source.credits,
      creditsMicros: source.creditsMicros,
    }),
    microsBalance: source.creditsMicros != null ? source.creditsMicros.toString() : null,
  };
}
