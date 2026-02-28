"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const HOME_SEEN_KEY = "pm_home_seen";

function capitalizeName(name: string): string {
  if (!name.trim()) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

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
  if (!Array.isArray(missions)) return null;
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

/** Frasi sotto CREDITI: stimolano raccolta tramite previsioni e missioni (brevi, ottimizzate per spazio). */
function getCreditsHook(credits: number | null): string {
  if (credits == null) return "";
  if (credits < 300) return "Prevedi e accumula crediti.";
  if (credits < 800) return "Missioni = bonus crediti.";
  if (credits < 1500) return "Ogni previsione ti ripaga.";
  if (credits < 3000) return "Completa missioni per salire.";
  return "Sei in forma. Continua così.";
}

/** Frasi sotto CLASSIFICA: complimenti se forte, incoraggiamento se indietro (brevi). */
function getRankHook(rank: number | undefined): string {
  if (rank == null) return "Prevedi per entrare in classifica.";
  if (rank <= 0) return "";
  if (rank === 1) return "Sei il migliore. Restaci.";
  if (rank <= 3) return "Podio d'élite. Difendilo.";
  if (rank <= 10) return "Top 10. Tutti ti guardano.";
  if (rank <= 30) return "La top 10 è vicina.";
  if (rank <= 100) return "Stai scalando. Continua così.";
  return "Prevedi per salire di posizione.";
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
  // Inizialmente sempre "Benvenuto" per evitare hydration mismatch (server non ha localStorage).
  const [welcomeWord, setWelcomeWord] = useState<"Benvenuto" | "Bentornato">("Benvenuto");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(HOME_SEEN_KEY);
    if (seen) {
      queueMicrotask(() => setWelcomeWord("Bentornato"));
    } else {
      localStorage.setItem(HOME_SEEN_KEY, "1");
    }
  }, []);

  const closestMission = missionsLoading ? null : pickClosestMission(missions);
  const remainingSteps = closestMission ? closestMission.target - closestMission.progress : 0;
  const nameCapitalized = capitalizeName(displayName);

  const showSpinHook = !spinLoading && canSpinToday === true;
  const showMissionHook = !showSpinHook && !missionsLoading && closestMission && remainingSteps >= 1;
  const rankPhrase = weeklyRank != null && weeklyRank > 100 ? getRankMotivationalPhrase(weeklyRank) : "";
  const creditsHook = getCreditsHook(credits);
  const rankHook = getRankHook(weeklyRank);

  return (
    <header className="mb-5 md:mb-6 text-center">
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
              {nameCapitalized.charAt(0)}
            </div>
          )}
        </div>
      </div>
      <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
        {welcomeWord} {nameCapitalized}
      </h1>

      {(showSpinHook || showMissionHook) && (
        <div className="mt-2 flex justify-center">
          {showSpinHook && (
            <Link
              href="/spin"
              className="text-sm font-medium text-white/95 hover:text-primary focus-visible:underline sm:text-ds-body-sm"
              title="Ricordati di riscattare la tua ricompensa quotidiana!"
            >
              Ricordati di{" "}
              <span className="home-spin-cta-word underline decoration-2 underline-offset-2">
                riscattare
              </span>{" "}
              la tua ricompensa quotidiana!
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

      {/* Summary: CREDITI | CLASSIFICA, sfondo trasparente, bordo LED/neon dinamico, frasi sotto */}
      <div className="home-summary-box home-summary-box-neon mx-auto mt-4 flex max-w-md overflow-hidden rounded-xl backdrop-blur-sm">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-3">
          <span className="text-ds-micro font-semibold uppercase tracking-wider text-white/70">Crediti</span>
          {creditsLoading ? (
            <span className="mt-1 tabular-nums text-lg font-bold text-white animate-pulse">—</span>
          ) : (
            <span className="home-summary-value mt-1 tabular-nums text-lg font-bold text-white">
              {credits != null ? credits.toLocaleString("it-IT") : "—"}
            </span>
          )}
          {creditsHook ? (
            <p className="mt-1 text-center text-xs leading-tight text-white/80 sm:text-ds-micro">
              {creditsHook}
            </p>
          ) : null}
        </div>
        <div
          className="w-px shrink-0 bg-gradient-to-b from-transparent via-white/30 to-transparent"
          style={{ boxShadow: "0 0 8px rgb(255 255 255 / 0.25)" }}
          aria-hidden
        />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-3">
          <span className="text-ds-micro font-semibold uppercase tracking-wider text-white/70">Classifica</span>
          {weeklyRank != null ? (
            weeklyRank <= 100 ? (
              <>
                <span className="home-summary-value mt-1 tabular-nums text-lg font-bold text-white">
                  #{weeklyRank}
                </span>
                {rankHook ? (
                  <p className="mt-1 text-center text-xs leading-tight text-white/80 sm:text-ds-micro">
                    {rankHook}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="mt-1 text-center text-ds-body-sm font-medium leading-snug text-white/95">
                  {rankPhrase}
                </p>
                {rankHook ? (
                  <p className="mt-1 text-center text-xs leading-tight text-white/80 sm:text-ds-micro">
                    {rankHook}
                  </p>
                ) : null}
              </>
            )
          ) : (
            <>
              <span className="mt-1 tabular-nums text-lg font-bold text-white/70">—</span>
              {rankHook ? (
                <p className="mt-1 text-center text-xs leading-tight text-white/80 sm:text-ds-micro">
                  {rankHook}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
