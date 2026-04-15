/**
 * Individual BRAIN agents: Analyst, Creative, Verifier, Resolver.
 * Each agent takes structured input and produces structured output via LLM.
 */

import type { MatchContext, FootballSignal } from "../types";
import { callAgent, parseJsonResponse } from "./llm";
import {
  ANALYST_SYSTEM,
  buildCreativeSystemPrompt,
  VERIFIER_SYSTEM,
  RESOLVER_SYSTEM,
} from "./prompts";
import { buildFeedbackPromptBlock } from "./feedback-context";

// ---------------------------------------------------------------------------
// Analyst
// ---------------------------------------------------------------------------

export interface AnalystInsight {
  insight: string;
  confidence: number;
  marketPotential: number;
  dataPoints: string[];
  suggestedAngle: string;
  /** True if this insight suggests cascade/chain events */
  isEventChain?: boolean;
}

interface AnalystOutput {
  insights: AnalystInsight[];
}

function buildAnalystContext(match: MatchContext): string {
  const lines: string[] = [];

  lines.push(`## Partita: ${match.match.homeTeam.name} vs ${match.match.awayTeam.name}`);
  lines.push(`Competizione: ${match.match.competition.name} (Tier ${match.match.competition.tier})`);
  lines.push(`Data: ${new Date(match.match.utcDate).toLocaleDateString("it-IT")} ${new Date(match.match.utcDate).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`);
  if (match.match.venue) lines.push(`Stadio: ${match.match.venue}`);
  if (match.match.referee) lines.push(`Arbitro: ${match.match.referee}`);
  lines.push(`Interest Score: ${match.interestScore}/100`);
  lines.push(`Temi: ${match.themes.join(", ")}`);

  if (match.odds) {
    lines.push("\n### Quote Bookmaker:");
    const h2h = match.odds.markets.filter((m) => m.market === "h2h");
    if (h2h.length > 0) {
      const first = h2h[0];
      lines.push(`  ${first.bookmaker}: ${first.outcomes.map((o) => `${o.name} @${o.price}`).join(" | ")}`);
    }
  }

  if (match.h2h) {
    lines.push(`\n### Head-to-Head (ultimi ${match.h2h.totalMatches} incontri):`);
    lines.push(`  Casa: ${match.h2h.homeWins} vittorie | Pareggi: ${match.h2h.draws} | Ospite: ${match.h2h.awayWins}`);
    for (const m of match.h2h.recentMatches.slice(0, 5)) {
      lines.push(`  ${m.date.slice(0, 10)}: ${m.homeTeam} ${m.homeGoals}-${m.awayGoals} ${m.awayTeam} (${m.competition})`);
    }
  }

  if (match.homeStanding || match.awayStanding) {
    lines.push("\n### Classifica:");
    if (match.homeStanding) {
      const s = match.homeStanding;
      lines.push(`  ${s.teamName}: ${s.position}° — ${s.points}pt (${s.won}V ${s.drawn}P ${s.lost}S) GD:${s.goalDifference} Form: ${s.form ?? "?"}`);
    }
    if (match.awayStanding) {
      const s = match.awayStanding;
      lines.push(`  ${s.teamName}: ${s.position}° — ${s.points}pt (${s.won}V ${s.drawn}P ${s.lost}S) GD:${s.goalDifference} Form: ${s.form ?? "?"}`);
    }
  }

  if (match.homeInjuries.length > 0 || match.awayInjuries.length > 0) {
    lines.push("\n### Infortuni/Assenze:");
    for (const inj of match.homeInjuries) {
      lines.push(`  [CASA] ${inj.name} — ${inj.injuryType ?? "indisponibile"}`);
    }
    for (const inj of match.awayInjuries) {
      lines.push(`  [OSPITE] ${inj.name} — ${inj.injuryType ?? "indisponibile"}`);
    }
  }

  const newsSignals = match.signals.filter(
    (s) => s.type === "news" || s.type === "social" || s.type === "press_conference"
  );
  if (newsSignals.length > 0) {
    lines.push("\n### Notizie e segnali:");
    for (const s of newsSignals.slice(0, 6)) {
      lines.push(`  [${s.source.name} T${s.source.tier}] ${s.headline}`);
    }
  }

  return lines.join("\n");
}

export async function runAnalyst(matches: MatchContext[]): Promise<AnalystInsight[]> {
  if (matches.length === 0) return [];

  // Limit to 8 matches — beyond that the context gets too long without adding value
  const contextBlocks = matches
    .slice(0, 8)
    .map((m) => buildAnalystContext(m))
    .join("\n---\n");

  const userMessage = `Analizza ${Math.min(matches.length, 8)} partite, trova pattern e insight non ovvi:\n\n${contextBlocks}`;

  const response = await callAgent("analyst", ANALYST_SYSTEM, userMessage);
  const parsed = parseJsonResponse<AnalystOutput>(response.content);

  if (!parsed?.insights) {
    console.warn("[BRAIN/analyst] Failed to parse insights, raw:", response.content.slice(0, 200));
    return [];
  }

  console.log(`[BRAIN/analyst] Found ${parsed.insights.length} insights (model: ${response.model})`);
  return parsed.insights;
}

// ---------------------------------------------------------------------------
// Creative
// ---------------------------------------------------------------------------

export interface CreativeEvent {
  title: string;
  marketType: string;
  outcomes?: Array<{ key: string; label: string }>;
  category: string;
  resolutionMethod: string;
  closesAtLogic: string;
  wow_factor: number;
  feasibility: number;
  /** 0-based index of the match within the batch (set by LLM) */
  matchIndex?: number;
  /** Populated by orchestrator after batch assignment */
  _matchId?: string;
  _matchLabel?: string;
}

interface CreativeOutput {
  events: CreativeEvent[];
}

function buildStandingsNarrative(match: MatchContext): string {
  const { homeStanding, awayStanding } = match;
  if (!homeStanding && !awayStanding) return "";

  const lines: string[] = ["\n### Contesto Classifica (per eventi narrativi):"];

  const totalTeams = 20; // approximate for most top-flight leagues

  if (homeStanding && awayStanding) {
    const pointsGap = Math.abs(homeStanding.points - awayStanding.points);
    const posGap = Math.abs(homeStanding.position - awayStanding.position);

    if (pointsGap <= 3 && posGap <= 3) {
      lines.push(`  ⚡ SCONTRO DIRETTO: ${homeStanding.teamName} (${homeStanding.position}°, ${homeStanding.points}pt) vs ${awayStanding.teamName} (${awayStanding.position}°, ${awayStanding.points}pt) — solo ${pointsGap}pt di distacco!`);
    }
  }

  for (const standing of [homeStanding, awayStanding]) {
    if (!standing) continue;

    if (standing.position <= 2) {
      lines.push(`  🏆 ${standing.teamName} è ${standing.position}° — in corsa per il titolo (${standing.points}pt, form: ${standing.form ?? "?"})`);
    } else if (standing.position <= 4) {
      lines.push(`  🌟 ${standing.teamName} è ${standing.position}° — zona Champions League (${standing.points}pt)`);
    }

    if (standing.position >= totalTeams - 2) {
      lines.push(`  ⚠ ${standing.teamName} è ${standing.position}° — zona retrocessione! (${standing.points}pt, form: ${standing.form ?? "?"})`);
    } else if (standing.position >= totalTeams - 4) {
      lines.push(`  📉 ${standing.teamName} è ${standing.position}° — rischia la retrocessione (${standing.points}pt)`);
    }

    const recentForm = standing.form?.slice(0, 5) ?? "";
    if (recentForm.length >= 4) {
      const losses = (recentForm.match(/L/g) || []).length;
      const wins = (recentForm.match(/W/g) || []).length;
      if (losses >= 3) {
        lines.push(`  📊 ${standing.teamName} in crisi: ${losses} sconfitte nelle ultime ${recentForm.length} partite (${recentForm})`);
      } else if (wins >= 4) {
        lines.push(`  📊 ${standing.teamName} in grande forma: ${wins} vittorie nelle ultime ${recentForm.length} partite (${recentForm})`);
      }
    }
  }

  return lines.length > 1 ? lines.join("\n") : "";
}

function buildCreativeContext(
  match: MatchContext,
  insights: AnalystInsight[]
): string {
  const base = buildAnalystContext(match);
  const standingsNarrative = buildStandingsNarrative(match);

  const relevantInsights = insights
    .filter((i) => i.marketPotential >= 0.4)
    .slice(0, 8);

  if (relevantInsights.length === 0 && !standingsNarrative) return base;

  const chainInsights = relevantInsights.filter((i) => i.isEventChain);
  const normalInsights = relevantInsights.filter((i) => !i.isEventChain);

  const normalBlock = normalInsights
    .map((i, idx) => `${idx + 1}. [conf:${i.confidence} pot:${i.marketPotential}] ${i.insight}\n   Angolazione: ${i.suggestedAngle}`)
    .join("\n");

  const chainBlock = chainInsights.length > 0
    ? `\n\n### ⛓ Event Chains individuate (genera mercati in cascata):\n` +
      chainInsights.map((i, idx) => `${idx + 1}. [CATENA] ${i.insight}\n   Genera: un evento "trigger" + uno "conseguenza" collegati`).join("\n")
    : "";

  const insightBlock = normalBlock ? `\n\n### Insight dall'Analyst:\n${normalBlock}` : "";

  return `${base}${standingsNarrative}${insightBlock}${chainBlock}`;
}

export async function runCreative(
  matches: MatchContext[],
  insights: AnalystInsight[],
  floatingSignals?: FootballSignal[]
): Promise<CreativeEvent[]> {
  if (matches.length === 0) return [];

  const feedbackBlock = await buildFeedbackPromptBlock();
  const systemPrompt = buildCreativeSystemPrompt() + feedbackBlock;
  const MAX_MATCHES = 12;
  const BATCH_SIZE = 3; // 3 matches per call → ~12 events per call → ~4500 tokens output

  const targetMatches = matches.slice(0, MAX_MATCHES);

  // Build all batch tasks upfront
  const batchTasks: Array<{ batchIdx: number; batch: MatchContext[]; userMessage: string }> = [];
  for (let i = 0; i < targetMatches.length; i += BATCH_SIZE) {
    const batch = targetMatches.slice(i, i + BATCH_SIZE);
    const contextBlocks = batch
      .map((m, idx) => `### PARTITA ${idx} (matchIndex:${idx})\n${buildCreativeContext(m, insights)}`)
      .join("\n\n");
    const userMessage = `Genera 6-10 eventi per partita (totale ${batch.length * 8} eventi circa). Includi "matchIndex": 0/1/2 su ogni evento per indicare a quale partita si riferisce.\n\n${contextBlocks}`;
    batchTasks.push({ batchIdx: i / BATCH_SIZE, batch, userMessage });
  }

  // Off-field signals — include as a parallel task if we have enough signals
  const offFieldSignals = floatingSignals?.filter((s) =>
    ["transfer_official", "transfer_rumor", "coach_change"].includes(s.type)
  ).slice(0, 6) ?? [];

  // Run all Creative batches in parallel (they are fully independent)
  const [matchBatchResults, offFieldEvents] = await Promise.all([
    Promise.all(
      batchTasks.map(async ({ batchIdx, batch, userMessage }) => {
        try {
          const response = await callAgent("creative", systemPrompt, userMessage);
          const parsed = parseJsonResponse<CreativeOutput>(response.content);
          if (!parsed?.events) return [] as CreativeEvent[];
          return parsed.events.map((event) => {
            const batchLocalIdx = typeof event.matchIndex === "number" && event.matchIndex < batch.length
              ? event.matchIndex
              : 0;
            const ctx = batch[batchLocalIdx];
            return {
              ...event,
              _matchId: ctx?.match.id,
              _matchLabel: ctx ? `${ctx.match.homeTeam.name} vs ${ctx.match.awayTeam.name}` : "Unknown",
            } as CreativeEvent;
          });
        } catch (err) {
          console.warn(`[BRAIN/creative] Batch ${batchIdx + 1} failed:`, err instanceof Error ? err.message : err);
          return [] as CreativeEvent[];
        }
      })
    ),
    offFieldSignals.length >= 3
      ? runCreativeFromFloatingSignals(offFieldSignals, systemPrompt)
      : Promise.resolve([] as CreativeEvent[]),
  ]);

  const allEvents: CreativeEvent[] = [
    ...matchBatchResults.flat(),
    ...offFieldEvents,
  ];

  console.log(`[BRAIN/creative] Generated ${allEvents.length} events (${batchTasks.length} match batches in parallel + ${offFieldSignals.length >= 3 ? 1 : 0} off-field call)`);
  return allEvents;
}

/** Generate off-field events from floating news signals (transfers, esoneri, gossip) */
async function runCreativeFromFloatingSignals(
  floatingSignals: FootballSignal[],
  systemPrompt: string
): Promise<CreativeEvent[]> {
  const relevant = floatingSignals
    .filter((s) => ["transfer_official", "transfer_rumor", "coach_change", "news", "press_conference"].includes(s.type))
    .slice(0, 15);

  if (relevant.length === 0) return [];

  const signalBlock = relevant
    .map((s) => `[${s.type.toUpperCase()} | ${s.source.name} T${s.source.tier}] ${s.headline}`)
    .join("\n");

  const userMessage = `Genera eventi di mercato OFF-FIELD basati su queste notizie recenti del calcio italiano. Focus su: trasferimenti, esoneri, dichiarazioni, record stagionali, classifiche.\n\nNotizie:\n${signalBlock}`;

  try {
    const response = await callAgent("creative", systemPrompt, userMessage);
    const parsed = parseJsonResponse<CreativeOutput>(response.content);
    if (parsed?.events) {
      return parsed.events.map((e) => ({
        ...e,
        _matchId: undefined,
        _matchLabel: "Off-field / Season",
      }));
    }
  } catch (err) {
    console.warn("[BRAIN/creative] Off-field events failed:", err instanceof Error ? err.message : err);
  }
  return [];
}

// ---------------------------------------------------------------------------
// Verifier
// ---------------------------------------------------------------------------

export interface VerifiedEvent {
  eventId: number;
  approved: boolean;
  rejectionReason?: string;
  modifications?: Record<string, unknown>;
  resolutionSource: {
    primary: string;
    secondary?: string;
    tertiary?: string;
  };
  resolutionCriteria: {
    yes?: string;
    no?: string;
    full?: string;
  };
  edgeCasePolicy: string;
  confidence: number;
}

interface VerifierOutput {
  verifications: VerifiedEvent[];
}

export async function runVerifier(
  events: CreativeEvent[],
  matches: MatchContext[]
): Promise<VerifiedEvent[]> {
  if (events.length === 0) return [];

  const feedbackBlock = await buildFeedbackPromptBlock();
  const verifierSystemPrompt = VERIFIER_SYSTEM + feedbackBlock;

  const matchSummary = matches
    .slice(0, 5)
    .map((m) => `${m.match.homeTeam.name} vs ${m.match.awayTeam.name} (${m.match.competition.name})`)
    .join(", ");

  // Batch of 20 events per LLM call to stay within token limits
  const BATCH_SIZE = 20;

  // Build all batch tasks upfront (event IDs are pre-assigned, batches are independent)
  const batchStarts = Array.from(
    { length: Math.ceil(events.length / BATCH_SIZE) },
    (_, i) => i * BATCH_SIZE
  );

  // Run all Verifier batches in parallel — they handle distinct event ID ranges
  const batchResults = await Promise.all(
    batchStarts.map(async (batchStart) => {
      const batchNum = batchStart / BATCH_SIZE + 1;
      const batch = events.slice(batchStart, batchStart + BATCH_SIZE);

      const eventList = batch
        .map((e, localIdx) => {
          const globalIdx = batchStart + localIdx;
          const feasTag = `wow:${e.wow_factor} feas:${e.feasibility}`;
          return `${globalIdx}|${e.title}|${e.marketType}|${e.closesAtLogic}|${feasTag}|${(e.resolutionMethod ?? "").slice(0, 80)}`;
        })
        .join("\n");

      const userMessage = `Verifica ${batch.length} eventi (id ${batchStart}-${batchStart + batch.length - 1}). Partite: ${matchSummary}\n\nEventi (id|titolo|tipo|chiusura|scores|risoluzione):\n${eventList}`;

      try {
        const response = await callAgent("verifier", verifierSystemPrompt, userMessage);
        const parsed = parseJsonResponse<VerifierOutput>(response.content);

        if (parsed?.verifications) {
          return parsed.verifications;
        }
        console.warn(`[BRAIN/verifier] Batch ${batchNum} parse failed, raw:`, response.content.slice(0, 150));
      } catch (err) {
        console.warn(`[BRAIN/verifier] Batch ${batchNum} failed:`, err instanceof Error ? err.message : err);
      }

      // Fallback: auto-approve events with feasibility >= 5 in this batch
      return batch
        .map((e, i) => ((e.feasibility ?? 0) >= 5 ? autoApprove(batchStart + i, e) : null))
        .filter((v): v is VerifiedEvent => v !== null);
    })
  );

  const allVerifications = batchResults.flat();
  const approved = allVerifications.filter((v) => v.approved);
  const rejected = allVerifications.filter((v) => !v.approved);
  console.log(`[BRAIN/verifier] ${approved.length} approved, ${rejected.length} rejected across ${batchStarts.length} parallel batches`);

  return allVerifications;
}

/** Fallback: auto-approve an event when the Verifier LLM fails */
function autoApprove(eventId: number, e: CreativeEvent): VerifiedEvent {
  return {
    eventId,
    approved: true,
    resolutionSource: { primary: e.resolutionMethod ?? "api-football statistics" },
    resolutionCriteria: {
      yes: "La condizione si verifica secondo i dati ufficiali.",
      no: "La condizione non si verifica.",
    },
    edgeCasePolicy: "Se la partita viene rinviata o annullata: mercato annullato e rimborsato.",
    confidence: 0.65,
  };
}

// ---------------------------------------------------------------------------
// Resolver (pre-compute resolution strategy)
// ---------------------------------------------------------------------------

export interface ResolutionStrategy {
  eventId: number;
  resolutionType: "AUTOMATIC" | "SEMI_AUTOMATIC" | "MANUAL";
  primarySource: Record<string, unknown>;
  secondarySource?: Record<string, unknown>;
  tertiarySource?: Record<string, unknown>;
  resolutionLogic: string;
  bufferHours: number;
  retryPolicy: { maxRetries: number; intervalMinutes: number };
}

interface ResolverOutput {
  resolutionStrategies: ResolutionStrategy[];
}

export async function runResolver(
  events: CreativeEvent[],
  verifications: VerifiedEvent[]
): Promise<ResolutionStrategy[]> {
  const approvedEvents = verifications
    .filter((v) => v.approved)
    .map((v) => {
      const event = events[v.eventId];
      if (!event) return null;
      return { ...v, event };
    })
    .filter(Boolean);

  if (approvedEvents.length === 0) return [];

  const eventList = approvedEvents
    .map((item, idx) => {
      if (!item) return "";
      return [
        `### Evento ${idx} (id originale: ${item.eventId}):`,
        `  Titolo: ${item.event.title}`,
        `  Tipo: ${item.event.marketType}`,
        `  Risoluzione proposta: ${item.event.resolutionMethod}`,
        `  Fonti verificate: ${item.resolutionSource.primary}${item.resolutionSource.secondary ? `, ${item.resolutionSource.secondary}` : ""}`,
      ].join("\n");
    })
    .join("\n\n");

  const userMessage = `Pre-computa la strategia di risoluzione per questi ${approvedEvents.length} eventi approvati:\n\n${eventList}`;

  const response = await callAgent("resolver", RESOLVER_SYSTEM, userMessage);
  const parsed = parseJsonResponse<ResolverOutput>(response.content);

  if (!parsed?.resolutionStrategies) {
    console.warn("[BRAIN/resolver] Failed to parse, raw:", response.content.slice(0, 200));
    return [];
  }

  console.log(`[BRAIN/resolver] ${parsed.resolutionStrategies.length} resolution strategies computed`);
  return parsed.resolutionStrategies;
}
