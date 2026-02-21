"use client";

import Link from "next/link";

interface Mission {
  id: string;
  name: string;
  target: number;
  progress: number;
  completed: boolean;
}

interface HomeHeaderPostLoginProps {
  displayName: string;
  userImage: string | null;
  credits: number | null;
  creditsLoading: boolean;
  canSpinToday: boolean | null;
  spinLoading: boolean;
  missions: Mission[];
  missionsLoading: boolean;
}

/**
 * Sceglie una missione realizzabile a breve: non completata, max 3 passi rimanenti (o altrimenti la più vicina, max 5).
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
  userImage,
  credits,
  creditsLoading,
  canSpinToday,
  spinLoading,
  missions,
  missionsLoading,
}: HomeHeaderPostLoginProps) {
  const closestMission = missionsLoading ? null : pickClosestMission(missions);
  const remainingSteps = closestMission ? closestMission.target - closestMission.progress : 0;

  // Un solo hook: spin se non ancora usato, altrimenti missione (mai assieme)
  const showSpinHook = !spinLoading && canSpinToday === true;
  const showMissionHook = !showSpinHook && !missionsLoading && closestMission && remainingSteps >= 1;

  return (
    <header className="mb-5 md:mb-6">
      <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-white/5 ring-2 ring-white/10 sm:h-14 sm:w-14">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white/80 sm:text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-ds-h1">
              Bentornato, {displayName}
            </h1>
            {showSpinHook && (
              <p className="mt-0.5 text-sm text-white/90 sm:text-ds-body-sm">
                <Link
                  href="/spin"
                  className="font-medium text-primary hover:text-primary-hover focus-visible:underline"
                >
                  Ricordati di riscattare la tua ricompensa quotidiana!
                </Link>
              </p>
            )}
            {showMissionHook && closestMission && (
              <p className="mt-0.5 text-sm text-white/90 sm:text-ds-body-sm">
                <Link
                  href="/missions"
                  className="font-medium text-primary hover:text-primary-hover focus-visible:underline"
                >
                  {remainingSteps === 1
                    ? `Sei a un passo dal completare la missione «${closestMission.name}»!`
                    : `Sei a ${remainingSteps} passi dal completare la missione «${closestMission.name}»!`}
                  <span className="ml-0.5" aria-hidden>🔥</span>
                </Link>
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] sm:px-4 sm:py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary sm:h-9 sm:w-9">
              <span className="text-base font-bold sm:text-lg" aria-label="crediti">$</span>
            </div>
            {creditsLoading ? (
              <span className="min-w-[3ch] tabular-nums text-lg font-bold text-white animate-pulse sm:text-xl">—</span>
            ) : (
              <span className="min-w-[3ch] tabular-nums text-lg font-bold text-white sm:text-xl">
                {credits != null ? credits.toLocaleString("it-IT") : "—"}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
