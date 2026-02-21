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
  weeklyRank: number | undefined;
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

/**
 * Frase motivazionale quando l'utente è fuori dalla top 100: incoraggia a giocare e scalare.
 */
function getRankMotivationalPhrase(rank: number): string {
  if (rank <= 100) return "";
  const gap = rank - 100;
  if (gap <= 15) return "Sei a pochi passi dalla top 100: fai altre previsioni e sali in classifica.";
  if (gap <= 40) return "La top 100 è a portata di mano: continua a prevedere e scala la classifica.";
  if (gap <= 80) return "Ogni previsione conta: avvicinati alla top 100 e fatti notare.";
  return "La classifica si conquista prevedendo: inizia ora e sali di posizione.";
}

export default function HomeHeaderPostLogin({
  displayName,
  userImage,
  credits,
  creditsLoading,
  weeklyRank,
  canSpinToday,
  spinLoading,
  missions,
  missionsLoading,
}: HomeHeaderPostLoginProps) {
  const closestMission = missionsLoading ? null : pickClosestMission(missions);
  const remainingSteps = closestMission ? closestMission.target - closestMission.progress : 0;

  const showSpinHook = !spinLoading && canSpinToday === true;
  const showMissionHook = !showSpinHook && !missionsLoading && closestMission && remainingSteps >= 1;
  const rankPhrase = weeklyRank != null && weeklyRank > 100 ? getRankMotivationalPhrase(weeklyRank) : "";

  return (
    <header className="mb-5 md:mb-6 text-center">
      {/* Nome centrato */}
      <div className="flex justify-center mb-2">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/25 bg-white/5 sm:h-16 sm:w-16">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/80 sm:text-3xl">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
        Bentornato, {displayName}!
      </h1>

      {/* Hook spin / missione centrato */}
      {(showSpinHook || showMissionHook) && (
        <div className="mt-2 flex justify-center">
          {showSpinHook && (
            <Link
              href="/spin"
              className="text-sm font-medium text-white/95 hover:text-primary focus-visible:underline sm:text-ds-body-sm"
              title="Ricordati di riscattare la tua ricompensa quotidiana!"
            >
              Ricordati di riscattare la tua ricompensa quotidiana!
            </Link>
          )}
          {showMissionHook && closestMission && (
            <Link
              href="/missions"
              className="text-sm font-medium text-white/95 hover:text-primary focus-visible:underline sm:text-ds-body-sm"
              title={remainingSteps === 1 ? `Sei a un passo dal completare la missione «${closestMission.name}»!` : `Sei a ${remainingSteps} passi dal completare la missione «${closestMission.name}»!`}
            >
              {remainingSteps === 1
                ? `Sei a un passo dal completare «${closestMission.name}»!`
                : `Sei a ${remainingSteps} passi dal completare «${closestMission.name}»!`}
              <span className="ml-0.5 inline-block shrink-0" aria-hidden>🔥</span>
            </Link>
          )}
        </div>
      )}

      {/* Summary box: due riquadri orizzontali (crediti + classifica) */}
      <div
        className="mx-auto mt-4 flex max-w-md overflow-hidden rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }}
      >
        <div className="flex flex-1 items-center justify-center gap-2 border-r border-white/15 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/25 text-primary" style={{ boxShadow: "0 0 10px -2px rgba(59,130,246,0.4)" }}>
            <span className="text-sm font-bold" aria-label="crediti">$</span>
          </div>
          {creditsLoading ? (
            <span className="tabular-nums text-base font-bold text-white animate-pulse">—</span>
          ) : (
            <span className="tabular-nums text-base font-bold text-white">
              {credits != null ? credits.toLocaleString("it-IT") : "—"}
            </span>
          )}
          <span className="text-ds-micro text-white/80">crediti</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-3">
          {weeklyRank != null ? (
            weeklyRank <= 100 ? (
              <>
                <span className="text-ds-micro text-white/80">Classifica</span>
                <span className="tabular-nums text-base font-bold text-white">#{weeklyRank}</span>
              </>
            ) : (
              <p className="text-center text-ds-body-sm font-medium leading-snug text-white/95">
                {rankPhrase}
              </p>
            )
          ) : (
            <>
              <span className="text-ds-micro text-white/80">Classifica</span>
              <span className="tabular-nums text-base font-bold text-white/70">—</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
