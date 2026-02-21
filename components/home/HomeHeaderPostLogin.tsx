"use client";

import Link from "next/link";

/** Simbolo credito virtuale (valuta generica) */
const CREDIT_SYMBOL = "¤";

interface Mission {
  id: string;
  name: string;
  target: number;
  progress: number;
  completed: boolean;
}

interface HomeHeaderPostLoginProps {
  displayName: string;
  credits: number | null;
  creditsLoading: boolean;
  canSpinToday: boolean | null;
  spinLoading: boolean;
  missions: Mission[];
  missionsLoading: boolean;
}

/**
 * Sceglie una missione "realizzabile nel super breve periodo":
 * non completata, con massimo 3 passi rimanenti (target - progress <= 3).
 * Se nessuna è così vicina, restituisce quella con il minor numero di passi rimanenti (max 5).
 */
function pickClosestMission(missions: Mission[]): Mission | null {
  const incomplete = missions.filter((m) => !m.completed && m.target > 0);
  if (incomplete.length === 0) return null;
  const withRemaining = incomplete.map((m) => ({ mission: m, remaining: m.target - m.progress }));
  const veryClose = withRemaining.filter((w) => w.remaining <= 3 && w.remaining >= 1);
  const pool = veryClose.length > 0 ? veryClose : withRemaining.filter((w) => w.remaining >= 1 && w.remaining <= 5);
  if (pool.length === 0) return null;
  pool.sort((a, b) => a.remaining - b.remaining);
  return pool[0].mission;
}

export default function HomeHeaderPostLogin({
  displayName,
  credits,
  creditsLoading,
  canSpinToday,
  spinLoading,
  missions,
  missionsLoading,
}: HomeHeaderPostLoginProps) {
  const closestMission = missionsLoading ? null : pickClosestMission(missions);
  const remainingSteps = closestMission ? closestMission.target - closestMission.progress : 0;

  return (
    <header className="mb-5 md:mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-ds-h1 font-bold text-fg truncate">
            Bentornato, {displayName}
          </h1>
          <div className="mt-2 space-y-1">
            <p className="text-ds-body-sm text-fg-muted">
              <Link
                href="/spin"
                className="text-primary hover:text-primary-hover font-medium focus-visible:underline"
              >
                Ricordati di riscattare la tua ricompensa quotidiana!
              </Link>
            </p>
            {closestMission && remainingSteps >= 1 && (
              <p className="text-ds-body-sm text-fg-muted">
                <Link
                  href="/missions"
                  className="text-primary hover:text-primary-hover font-medium focus-visible:underline"
                >
                  {remainingSteps === 1
                    ? `Sei a un passo dal completare la missione «${closestMission.name}»!`
                    : `Sei a ${remainingSteps} passi dal completare la missione «${closestMission.name}»!`}
                </Link>
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 sm:pt-0.5">
          {creditsLoading ? (
            <span className="text-ds-h2 font-bold text-fg tabular-nums animate-pulse">—</span>
          ) : (
            <span className="text-ds-h2 font-bold text-fg tabular-nums">
              {credits != null ? credits.toLocaleString("it-IT") : "—"}
              <span className="ml-0.5 text-primary font-semibold" aria-label="crediti">
                {CREDIT_SYMBOL}
              </span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
