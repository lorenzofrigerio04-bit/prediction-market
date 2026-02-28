"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { trackView } from "@/lib/analytics-client";
import {
  PageHeader,
  SectionContainer,
  EmptyState,
  LoadingBlock,
} from "@/components/ui";
import { IconTarget, IconCheck, IconInfo } from "@/components/ui/Icons";
import CrystalBallOnly from "@/components/crea/CrystalBallOnly";

export interface MissionDTO {
  id: string;
  title: string;
  description: string;
  progressValue: number;
  targetValue: number;
  rewards: { credits: number; xp: number; badgeCode?: string };
  expiresAt: string | null;
  status: string;
  badgeUnlock: string | null;
  badgeName?: string;
  badgeIcon?: string | null;
  code: string;
  type: string;
  sortOrder?: number | null;
}

export interface ChapterSection {
  level: number;
  title: string;
  xpRequired: number;
  missions: MissionDTO[];
  isCurrent: boolean;
}

export interface MissionsResponse {
  daily: MissionDTO | null;
  weekly: MissionDTO[];
  chapters: ChapterSection[];
  skill: MissionDTO[];
  user: {
    xpTotal: number;
    level: number;
    xpToNext: number;
    xpRequiredForCurrent: number;
  };
  streak: number;
  canSpinToday?: boolean;
  todaySpinCredits?: number | null;
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("it-IT").format(n);
}

function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const end = new Date(expiresAt);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, diff);
}

/** Ordina: prima missioni da sbloccare (non riscattate), poi già riscattate */
function sortByUnlockFirst<T extends { status: string }>(missions: T[]): T[] {
  return [...missions].sort((a, b) =>
    (a.status === "CLAIMED" ? 1 : 0) - (b.status === "CLAIMED" ? 1 : 0)
  );
}

export default function MissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<MissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/missions");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Errore nel caricamento delle missioni");
        setData(null);
        return;
      }
      setData(json as MissionsResponse);
    } catch (err) {
      console.error(err);
      setError("Errore nel caricamento delle missioni");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      trackView("MISSION_VIEWED");
      fetchMissions();
    }
  }, [status, router, fetchMissions]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Notify once when there are completed missions to claim (on first load)
  const hasShownCompletedToast = React.useRef(false);
  useEffect(() => {
    if (!data || hasShownCompletedToast.current) return;
    const completed = [
      data.daily,
      ...data.weekly,
      ...data.skill,
      ...data.chapters.flatMap((c) => c.missions),
    ].filter((m): m is MissionDTO => m != null && m.status === "COMPLETED");
    if (completed.length > 0) {
      hasShownCompletedToast.current = true;
      setToast({
        message: `Missione completata! Riscatta +${formatAmount(completed[0]?.rewards.credits ?? 0)} crediti`,
        type: "success",
      });
    }
  }, [data]);

  const handleClaim = async (userMissionId: string) => {
    setClaimingId(userMissionId);
    try {
      const res = await fetch("/api/missions/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMissionId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ message: body.error ?? "Errore nel riscatto", type: "info" });
        return;
      }
      const parts = [`+${formatAmount(body.credits ?? 0)} crediti`];
      if (body.xp) parts.push(`+${body.xp} XP`);
      if (body.badgeUnlocked) parts.push(`Badge: ${body.badgeUnlocked}`);
      setToast({ message: `Riscattato! ${parts.join(" · ")}`, type: "success" });
      await fetchMissions();
    } finally {
      setClaimingId(null);
    }
  };


  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
          <LoadingBlock message="Caricamento missioni..." />
        </main>
      </div>
    );
  }

  const hasData = data != null;
  const isEmpty =
    hasData &&
    !data.daily &&
    data.weekly.length === 0 &&
    data.chapters.every((c) => c.missions.length === 0) &&
    data.skill.length === 0;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
        <PageHeader
          title="MISSIONI"
          description="Completa le missioni, avanza di livello e guadagna crediti."
          align="center"
        />

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-ds-body-sm flex flex-wrap items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchMissions()}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-500/30"
            >
              Riprova
            </button>
          </div>
        )}

        {!hasData && !error && (
          <LoadingBlock message="Caricamento missioni..." />
        )}

        {hasData && (
          <>
        {toast && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
              toast.type === "success"
                ? "bg-green-600/90 text-white"
                : "bg-slate-700/90 text-slate-100"
            }`}
            role="alert"
          >
            {toast.message}
          </div>
        )}

        {/* Bonus giornaliero + streak */}
        <SectionContainer>
          <div className="rounded-xl border border-white/10 bg-bg p-4 sm:p-5 event-detail-box">
            <p className="text-ds-body-sm text-fg-muted">Bonus giornaliero</p>
            {data?.canSpinToday ? (
              <>
                <p className="text-ds-body font-bold text-fg mt-0.5">
                  Riscatta il tuo bonus giornaliero!
                </p>
                <div className="mt-1 flex justify-end">
                  <Link
                    href="/spin"
                    className="text-ds-body-sm font-medium text-primary hover:underline min-h-[44px] flex items-center ds-tap-target"
                  >
                    Gira la ruota →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 flex items-center gap-1.5 text-ds-h2 font-sans leading-none">
                  <span className="font-semibold tabular-nums text-white">
                    {data?.todaySpinCredits != null ? data.todaySpinCredits.toLocaleString("it-IT") : "—"}
                  </span>
                  <svg className="h-[0.9em] w-[0.9em] shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden style={{ verticalAlign: "middle" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-ds-body-sm text-fg-muted">
                  <IconCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
                  Ruota già girata
                </p>
              </>
            )}
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-ds-body font-semibold text-fg">
                La tua streak: {data?.streak ?? 0} <span className="inline-block text-lg leading-none" aria-hidden>🔥</span>
              </p>
            </div>
          </div>
        </SectionContainer>

        {isEmpty && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-ds-body-sm">
            <p className="font-medium mb-1">Nessuna missione disponibile</p>
            <p>
              Le missioni vengono caricate dal database. Se hai appena installato il progetto, esegui il seed:{" "}
              <code className="bg-black/20 px-1 rounded">npx prisma db seed</code>
            </p>
          </div>
        )}

        {/* A) Missione del Giorno (include "Primo evento" se presente e non riscattata) */}
        <SectionContainer>
          <h2 className="text-ds-h2 font-bold text-fg mb-4">Missione del Giorno</h2>
          {(() => {
            const firstEventMission = data.chapters
              .flatMap((c) => c.missions)
              .find((m) => m.code === "CH1_FIRST_EVENT");
            const showFirstEventInDaily =
              firstEventMission != null && firstEventMission.status !== "CLAIMED";
            const dailyList: MissionDTO[] = [
              ...(showFirstEventInDaily && firstEventMission ? [firstEventMission] : []),
              ...(data.daily ? [data.daily] : []),
            ];
            const sorted = sortByUnlockFirst(dailyList);
            if (sorted.length === 0) {
              return (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-ds-body-sm text-fg-muted">
                  Nessuna missione del giorno assegnata. Torna domani o ricarica la pagina.
                </div>
              );
            }
            return (
              <div className="space-y-2">
                {sorted.map((m) => (
                  <MissionCard
                    key={m.id}
                    mission={m}
                    onClaim={handleClaim}
                    claimingId={claimingId}
                    daysLeft={daysLeft(m.expiresAt)}
                  />
                ))}
              </div>
            );
          })()}
        </SectionContainer>

        {/* B) Missioni Settimanali */}
        <SectionContainer>
          <h2 className="text-ds-h2 font-bold text-fg mb-4">Missioni Settimanali</h2>
          {data.weekly.length > 0 ? (
            <div className="space-y-2">
              {sortByUnlockFirst(data.weekly).map((m) => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  onClaim={handleClaim}
                  claimingId={claimingId}
                  daysLeft={daysLeft(m.expiresAt)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-ds-body-sm text-fg-muted">
              Nessuna missione settimanale. Ricarica la pagina.
            </div>
          )}
        </SectionContainer>

        {/* C) Percorso di Progressione – ruota e sfera direttamente sullo sfondo, senza riquadro */}
        <SectionContainer>
          <h2 className="text-ds-h2 font-bold text-fg mb-4">Percorso di Progressione</h2>
          {/* Ruota: anello sottile (5 spicchi) intorno all'oracolo protagonista */}
          <div className="relative flex items-center justify-center w-full max-w-[260px] mx-auto aspect-square">
              <svg
                className="w-full h-full"
                viewBox="0 0 200 200"
                aria-hidden
              >
                <defs>
                  {/* Trama liquid glass come i box: gradiente 135° */}
                  <linearGradient id="levelWheelGlassFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                  </linearGradient>
                  {/* Gradiente per segmento: colore pieno lato "entrata" → trasparente verso livello successivo */}
                  {data.chapters.map((_ch, i) => {
                    const startDeg = -126 + i * 72;
                    const endDeg = -126 + (i + 1) * 72;
                    const toRad = (d: number) => (d * Math.PI) / 180;
                    const cx = 100;
                    const cy = 100;
                    const midR = 65;
                    const gx1 = cx + midR * Math.cos(toRad(startDeg));
                    const gy1 = cy + midR * Math.sin(toRad(startDeg));
                    const gx2 = cx + midR * Math.cos(toRad(endDeg));
                    const gy2 = cy + midR * Math.sin(toRad(endDeg));
                    return (
                      <linearGradient
                        key={`grad-${i}`}
                        id={`levelWheelSegmentGrad-${i}`}
                        x1={gx1}
                        y1={gy1}
                        x2={gx2}
                        y2={gy2}
                        gradientUnits="userSpaceOnUse"
                        className="level-wheel-segment-gradient"
                      >
                        <stop offset="0%" className="level-wheel-segment-gradient-start" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    );
                  })}
                  {/* Archi per etichette: fuori dallo spicchio, seguono la curvatura */}
                  {data.chapters.map((_ch, i) => {
                    const startDeg = -126 + i * 72;
                    const endDeg = -126 + (i + 1) * 72;
                    const toRad = (d: number) => (d * Math.PI) / 180;
                    const cx = 100;
                    const cy = 100;
                    const labelR = 82;
                    const xs = cx + labelR * Math.cos(toRad(startDeg));
                    const ys = cy + labelR * Math.sin(toRad(startDeg));
                    const xe = cx + labelR * Math.cos(toRad(endDeg));
                    const ye = cy + labelR * Math.sin(toRad(endDeg));
                    const large = 72 > 180 ? 1 : 0;
                    const arcD = `M ${xs} ${ys} A ${labelR} ${labelR} 0 ${large} 1 ${xe} ${ye}`;
                    return <path key={`arc-${i}`} id={`levelWheelLabelArc-${i}`} d={arcD} fill="none" aria-hidden />;
                  })}
                </defs>
                {data.chapters.map((ch, i) => {
                  const isReached = data.user.level >= ch.level;
                  const startDeg = -126 + i * 72;
                  const endDeg = -126 + (i + 1) * 72;
                  const toRad = (d: number) => (d * Math.PI) / 180;
                  const cx = 100;
                  const cy = 100;
                  const inner = 58;
                  const outer = 72;
                  const x1 = cx + inner * Math.cos(toRad(startDeg));
                  const y1 = cy + inner * Math.sin(toRad(startDeg));
                  const x2 = cx + outer * Math.cos(toRad(startDeg));
                  const y2 = cy + outer * Math.sin(toRad(startDeg));
                  const x3 = cx + outer * Math.cos(toRad(endDeg));
                  const y3 = cy + outer * Math.sin(toRad(endDeg));
                  const x4 = cx + inner * Math.cos(toRad(endDeg));
                  const y4 = cy + inner * Math.sin(toRad(endDeg));
                  const large = 72 > 180 ? 1 : 0;
                  const d = `M ${x1} ${y1} L ${x2} ${y2} A ${outer} ${outer} 0 ${large} 1 ${x3} ${y3} L ${x4} ${y4} A ${inner} ${inner} 0 ${large} 0 ${x1} ${y1} Z`;
                  const fill = isReached
                    ? `url(#levelWheelSegmentGrad-${i})`
                    : "url(#levelWheelGlassFill)";
                  return (
                    <path
                      key={ch.level}
                      d={d}
                      fill={fill}
                      className={`level-wheel-segment transition-all duration-400 ease-out ${isReached ? "level-wheel-segment--reached" : ""}`}
                    />
                  );
                })}
                {/* Etichette: all'esterno dello spicchio, curvate; sbloccate = in evidenza, da sbloccare = visibili ma in stile "locked" */}
                {data.chapters.map((ch, i) => {
                  const isReached = data.user.level >= ch.level;
                  return (
                    <text
                      key={`label-${ch.level}`}
                      textAnchor="middle"
                      fontFamily="var(--font-sans), system-ui, sans-serif"
                      className={`level-wheel-label uppercase tracking-[0.14em] pointer-events-none ${isReached ? "level-wheel-label--reached" : "level-wheel-label--locked"}`}
                    >
                      <textPath href={`#levelWheelLabelArc-${i}`} startOffset="50%" method="align" spacing="auto">
                        {ch.title}
                      </textPath>
                    </text>
                  );
                })}
              </svg>
              {/* Oracolo al centro: nessuno sfondo nel cerchio centrale */}
              <div className="level-wheel-oracle absolute inset-0 flex items-center justify-center pointer-events-none bg-transparent">
                <div className="level-wheel-oracle-inner">
                  <CrystalBallOnly />
                </div>
              </div>
            </div>

          {/* Specifiche livello corrente: barra XP e missioni */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 event-detail-box p-5 sm:p-6">
            <div className="mb-4">
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <span className="text-ds-h3 font-bold text-fg">
                  {(() => {
                    const ch = data.chapters.find((c) => c.level === data.user.level);
                    return ch ? `Livello ${data.user.level} – ${ch.title}` : `Livello ${data.user.level}`;
                  })()}
                </span>
                <span className="text-ds-body-sm font-semibold tabular-nums text-primary">
                  {formatAmount(data.user.xpTotal)} XP
                </span>
              </div>
              <div className="h-3 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="animate-level-progress-fill h-full rounded-full level-progress-bar-fill transition-all duration-500"
                  style={{
                    ["--level-progress-pct" as string]: `${
                      (() => {
                        const progressInSegment = Math.max(
                          0,
                          data.user.xpTotal - (data.user.xpRequiredForCurrent ?? 0)
                        );
                        const segmentLength =
                          data.user.xpToNext + progressInSegment || 1;
                        return data.user.xpToNext === 0
                          ? 100
                          : Math.min(
                              100,
                              (progressInSegment / segmentLength) * 100
                            );
                      })()
                    }%`,
                  }}
                />
              </div>
              {data.user.xpToNext > 0 && (
                <p className="text-ds-micro text-fg-muted mt-1.5">
                  {data.user.xpToNext} XP al prossimo livello
                </p>
              )}
            </div>
            {(() => {
              const currentChapter = data.chapters.find((c) => c.isCurrent);
              const firstEventInDaily = currentChapter?.missions.find((m) => m.code === "CH1_FIRST_EVENT");
              const hideFirstEventFromChapter =
                firstEventInDaily != null && firstEventInDaily.status !== "CLAIMED";
              const levelMissions = currentChapter
                ? currentChapter.missions.filter(
                    (m) => !(m.code === "CH1_FIRST_EVENT" && hideFirstEventFromChapter)
                  )
                : [];
              if (levelMissions.length === 0) return null;
              return (
                <div className="space-y-2">
                  <p className="text-ds-body-sm font-semibold text-fg">
                    Missioni del livello corrente
                  </p>
                  {sortByUnlockFirst(levelMissions).map((m) => (
                    <MissionCard
                      key={m.id}
                      mission={m}
                      onClaim={handleClaim}
                      claimingId={claimingId}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        </SectionContainer>

        {/* D) Obiettivi di Precisione */}
        <SectionContainer>
          <h2 className="text-ds-h2 font-bold text-fg mb-4">Obiettivi di Precisione</h2>
          {data.skill.length > 0 ? (
            <div className="space-y-2">
              {sortByUnlockFirst(data.skill).map((m) => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  onClaim={handleClaim}
                  claimingId={claimingId}
                  tooltip="La precisione è (vittorie / previsioni risolte) × 100. Servono almeno 10 previsioni risolte per il 60%, 20 per l'80%."
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-ds-body-sm text-fg-muted">
              Nessun obiettivo di precisione disponibile.
            </div>
          )}
        </SectionContainer>

        <details className="mt-6 group">
          <summary className="text-ds-body-sm text-fg-muted cursor-pointer list-none inline-flex items-center gap-1.5 hover:text-fg">
            <span className="inline-flex w-5 h-5 items-center justify-center rounded-full border border-current text-ds-micro font-bold">
              ?
            </span>
            Come funziona
          </summary>
          <ul className="mt-3 space-y-1.5 text-ds-body-sm text-fg-muted pl-7">
            <li>
              <strong className="text-fg">Missione del giorno:</strong> una nuova ogni giorno, riscattala dopo averla completata.
            </li>
            <li>
              <strong className="text-fg">Settimanali:</strong> 3 missioni a settimana, scadenza lunedì.
            </li>
            <li>
              <strong className="text-fg">Percorso:</strong> completa i capitoli del tuo livello per salire e sbloccare badge.
            </li>
            <li>
              <strong className="text-fg">Precisione:</strong> vittorie / previsioni risolte. Gli obiettivi richiedono un minimo di previsioni risolte.
            </li>
            <li>
              <strong className="text-fg">Bonus:</strong> ritira il bonus nel Wallet per la streak (fino a ×2 in 10 giorni).
            </li>
            </ul>
        </details>
          </>
        )}
      </main>
    </div>
  );
}

function MissionCard({
  mission,
  onClaim,
  claimingId,
  daysLeft: daysLeftProp,
  tooltip,
}: {
  mission: MissionDTO;
  onClaim: (id: string) => void;
  claimingId: string | null;
  daysLeft?: number | null;
  tooltip?: string;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  const pct =
    mission.targetValue > 0
      ? Math.min(100, (mission.progressValue / mission.targetValue) * 100)
      : 0;
  const isCompleted = mission.status === "COMPLETED";
  const isClaimed = mission.status === "CLAIMED";
  const isExpired = mission.status === "EXPIRED";

  useEffect(() => {
    if (!infoOpen) return;
    const close = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [infoOpen]);

  return (
    <div
      className={`relative rounded-xl border p-3 sm:p-4 transition-all duration-200 event-detail-box ${
        isClaimed
          ? "mission-card-claimed bg-white/5"
          : isExpired
            ? "border-white/5 bg-white/5 opacity-75"
            : "border-white/10 bg-surface/30 dark:bg-white/5 hover:border-primary/30"
      }`}
    >
      {tooltip && (
        <div className="absolute top-3 right-3 z-10" ref={infoRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInfoOpen((v) => !v);
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full text-fg-muted hover:text-fg hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            aria-label="Info"
            aria-expanded={infoOpen}
          >
            <IconInfo className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
          {infoOpen && (
            <div
              className="mission-info-popup absolute right-0 top-full z-20 mt-1.5 w-64 max-w-[calc(100vw-2rem)] px-3 py-2.5 text-left text-ds-body-sm text-fg-muted"
              role="dialog"
              aria-label="Informazione"
            >
              {tooltip}
            </div>
          )}
        </div>
      )}
      <div className="flex items-start gap-3 min-w-0">
        <span
          className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${
            isClaimed || isExpired
              ? "bg-white/10 text-fg-muted"
              : isCompleted
                ? "bg-green-500/20 text-green-500"
                : "bg-primary/15 text-primary"
          }`}
          aria-hidden
        >
          {isClaimed || isExpired ? (
            <IconCheck className="w-5 h-5" />
          ) : (
            <IconTarget className="w-5 h-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-fg text-ds-body-sm truncate uppercase">
              {mission.title}
            </h3>
            {daysLeftProp != null && !isClaimed && !isExpired && (
              <span className="text-ds-micro text-fg-muted">
                {daysLeftProp} gg
              </span>
            )}
          </div>
          <p className="text-ds-body-sm text-fg-muted mt-0.5 line-clamp-2">
            {mission.description}
          </p>
          {!isClaimed && !isExpired && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 min-w-0 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[140px]">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-ds-micro font-medium text-fg-muted tabular-nums">
                {mission.progressValue}/{mission.targetValue}
              </span>
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {mission.rewards.credits > 0 && (
              <span className="text-ds-micro font-medium text-primary">
                +{formatAmount(mission.rewards.credits)} crediti
              </span>
            )}
            {mission.rewards.xp > 0 && (
              <span className="text-ds-micro font-medium text-fg-muted">
                +{mission.rewards.xp} XP
              </span>
            )}
            {mission.badgeUnlock && (
              <span
                className="inline-flex items-center gap-1.5 text-ds-micro font-medium text-fg-muted"
                title={mission.badgeName ?? undefined}
              >
                <span>Badge:</span>
                <span className="text-base leading-none" aria-hidden>
                  {mission.badgeIcon ?? "🏆"}
                </span>
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isCompleted && (
                <button
                  type="button"
                  onClick={() => onClaim(mission.id)}
                  disabled={claimingId === mission.id}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-fg text-ds-body-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {claimingId === mission.id ? "Riscatto..." : "Riscatta"}
                </button>
              )}
              {isClaimed && (
                <span className="text-ds-body-sm text-fg-muted inline-flex items-center gap-1">
                  <IconCheck className="w-4 h-4 text-green-500" />
                  Riscattata
                </span>
              )}
              {isExpired && (
                <span className="text-ds-body-sm text-fg-muted">Scaduta</span>
              )}
            </div>
            {!isClaimed && !isExpired && !isCompleted && (
              <Link
                href={mission.code === "CH1_FIRST_EVENT" ? "/crea" : "/discover"}
                className="text-ds-body-sm font-medium text-primary hover:underline shrink-0"
              >
                {mission.code === "CH1_FIRST_EVENT" ? "Vai a Crea evento →" : "Vai agli eventi →"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
