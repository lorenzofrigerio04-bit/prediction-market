/**
 * Individual BRAIN agents: Analyst, Creative, Verifier, Resolver.
 * Each agent takes structured input and produces structured output via LLM.
 */

import type { MatchContext, FootballSignal } from "../types";
import { callAgent, parseJsonResponse } from "./llm";
import {
  ANALYST_SYSTEM,
  CREATIVE_SYSTEM,
  VERIFIER_SYSTEM,
  RESOLVER_SYSTEM,
} from "./prompts";

// ---------------------------------------------------------------------------
// Analyst
// ---------------------------------------------------------------------------

export interface AnalystInsight {
  insight: string;
  confidence: number;
  marketPotential: number;
  dataPoints: string[];
  suggestedAngle: string;
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
    for (const s of newsSignals.slice(0, 8)) {
      lines.push(`  [${s.source.name} T${s.source.tier}] ${s.headline}`);
    }
  }

  return lines.join("\n");
}

export async function runAnalyst(matches: MatchContext[]): Promise<AnalystInsight[]> {
  if (matches.length === 0) return [];

  const contextBlocks = matches
    .slice(0, 10)
    .map((m) => buildAnalystContext(m))
    .join("\n\n---\n\n");

  const userMessage = `Analizza queste ${Math.min(matches.length, 10)} partite e trova tutti i pattern e insight interessanti:\n\n${contextBlocks}`;

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
  /** Populated by orchestrator: which match this event is about */
  _matchId?: string;
  _matchLabel?: string;
}

interface CreativeOutput {
  events: CreativeEvent[];
}

function buildCreativeContext(
  match: MatchContext,
  insights: AnalystInsight[]
): string {
  const base = buildAnalystContext(match);
  const relevantInsights = insights
    .filter((i) => i.marketPotential >= 0.4)
    .slice(0, 6);

  if (relevantInsights.length === 0) return base;

  const insightBlock = relevantInsights
    .map((i, idx) => `${idx + 1}. [conf:${i.confidence} pot:${i.marketPotential}] ${i.insight}\n   Angolazione: ${i.suggestedAngle}`)
    .join("\n");

  return `${base}\n\n### Insight dall'Analyst:\n${insightBlock}`;
}

export async function runCreative(
  matches: MatchContext[],
  insights: AnalystInsight[]
): Promise<CreativeEvent[]> {
  if (matches.length === 0) return [];

  const allEvents: CreativeEvent[] = [];

  // Process in batches of 3 matches per LLM call for cost efficiency
  const batchSize = 3;
  for (let i = 0; i < Math.min(matches.length, 12); i += batchSize) {
    const batch = matches.slice(i, i + batchSize);
    const contextBlocks = batch
      .map((m) => buildCreativeContext(m, insights))
      .join("\n\n---\n\n");

    const userMessage = `Genera eventi di mercato creativi per queste ${batch.length} partite. Ricorda: diversifica i tipi di mercato, cerca il "wow factor", e assicurati che ogni evento sia risolvibile oggettivamente.\n\n${contextBlocks}`;

    try {
      const response = await callAgent("creative", CREATIVE_SYSTEM, userMessage);
      const parsed = parseJsonResponse<CreativeOutput>(response.content);

      if (parsed?.events) {
        for (const event of parsed.events) {
          // Tag with match reference
          event._matchId = batch[0]?.match.id;
          event._matchLabel = batch.map((m) => `${m.match.homeTeam.name} vs ${m.match.awayTeam.name}`).join(", ");
          allEvents.push(event);
        }
      }
    } catch (err) {
      console.warn(`[BRAIN/creative] Batch ${i} failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`[BRAIN/creative] Generated ${allEvents.length} event ideas`);
  return allEvents;
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

  const eventList = events
    .map((e, idx) => {
      const lines = [
        `### Evento ${idx}:`,
        `  Titolo: ${e.title}`,
        `  Tipo: ${e.marketType}`,
        `  Categoria: ${e.category}`,
        `  Risoluzione: ${e.resolutionMethod}`,
        `  Chiusura: ${e.closesAtLogic}`,
        `  Wow: ${e.wow_factor}/10 | Fattibilità: ${e.feasibility}/10`,
        `  Partita: ${e._matchLabel ?? "N/A"}`,
      ];
      if (e.outcomes) {
        lines.push(`  Outcomes: ${e.outcomes.map((o) => o.label).join(" | ")}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");

  const matchSummary = matches
    .slice(0, 6)
    .map((m) => `${m.match.homeTeam.name} vs ${m.match.awayTeam.name} (${m.match.competition.name}, ${new Date(m.match.utcDate).toLocaleDateString("it-IT")})`)
    .join("\n");

  const userMessage = `Verifica questi ${events.length} eventi proposti.\n\nPartite di riferimento:\n${matchSummary}\n\n${eventList}`;

  const response = await callAgent("verifier", VERIFIER_SYSTEM, userMessage);
  const parsed = parseJsonResponse<VerifierOutput>(response.content);

  if (!parsed?.verifications) {
    console.warn("[BRAIN/verifier] Failed to parse, raw:", response.content.slice(0, 200));
    return [];
  }

  const approved = parsed.verifications.filter((v) => v.approved);
  const rejected = parsed.verifications.filter((v) => !v.approved);
  console.log(
    `[BRAIN/verifier] ${approved.length} approved, ${rejected.length} rejected (model: ${response.model})`
  );

  return parsed.verifications;
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
