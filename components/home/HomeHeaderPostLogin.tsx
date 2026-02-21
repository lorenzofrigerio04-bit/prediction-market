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
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/25 bg-white/5 sm:h-14 sm:w-14">
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
              <p className="mt-0.5 min-w-0">
                <Link
                  href="/spin"
                  className="inline-block max-w-full truncate align-baseline text-sm font-medium text-white/95 hover:text-primary focus-visible:underline sm:text-ds-body-sm"
                  title="Ricordati di riscattare la tua ricompensa quotidiana!"
                >
                  Ricordati di riscattare la tua ricompensa quotidiana!
                </Link>
              </p>
            )}
            {showMissionHook && closestMission && (
              <p className="mt-0.5 min-w-0">
                <Link
                  href="/missions"
                  className="inline-block max-w-full truncate align-baseline text-sm font-medium text-white/95 hover:text-primary focus-visible:underline sm:text-ds-body-sm"
                  title={remainingSteps === 1 ? `Sei a un passo dal completare la missione «${closestMission.name}»!` : `Sei a ${remainingSteps} passi dal completare la missione «${closestMission.name}»!`}
                >
                  {remainingSteps === 1
                    ? `Sei a un passo dal completare «${closestMission.name}»!`
                    : `Sei a ${remainingSteps} passi dal completare «${closestMission.name}»!`}
                  <span className="ml-0.5 inline-block shrink-0" aria-hidden>🔥</span>
                </Link>
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <div
            className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-black/30 px-2 py-1.5 sm:px-2.5 sm:py-2"
            style={{
              boxShadow: "0 0 0 1px rgba(255,255,255,0.12), 0 0 14px -2px rgba(59,130,246,0.45), 0 0 24px -8px rgba(59,130,246,0.25)",
            }}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/30 text-primary sm:h-7 sm:w-7" style={{ boxShadow: "0 0 10px -2px rgba(59,130,246,0.5)" }}>
              <span className="text-sm font-bold sm:text-base" aria-label="crediti">$</span>
            </div>
            {creditsLoading ? (
              <span className="min-w-[2.5ch] tabular-nums text-base font-bold text-white animate-pulse sm:text-lg">—</span>
            ) : (
              <span className="min-w-[2.5ch] tabular-nums text-base font-bold text-white sm:text-lg">
                {credits != null ? credits.toLocaleString("it-IT") : "—"}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
