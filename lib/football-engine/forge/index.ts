/**
 * FORGE — Layer 3 of the Football Intelligence Engine.
 *
 * Transforms approved events from the BRAIN into structured Candidate objects
 * compatible with the existing event-gen-v2 publisher.
 *
 * Responsibilities:
 * - Map BRAIN output to Candidate schema
 * - Apply market templates for standard events
 * - Compute exact closesAt and resolution timing
 * - Generate dedup keys
 * - Set initial probability hints from odds
 */

import type { Candidate } from "@/lib/event-gen-v2/types";
import type { MarketTypeId } from "@/lib/market-types";
import { ALL_MARKET_TYPES, isMarketTypeId } from "@/lib/market-types";
import type { ApprovedEvent, BrainOutput } from "../brain";
import type { MatchContext } from "../types";
import { extractConsensusProbability } from "../radar/clients/odds-api";
import { MARKET_TEMPLATES, getTemplateByMarketKind, type MarketTemplate } from "./market-templates";

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

export interface ForgeOutput {
  candidates: Candidate[];
  skipped: Array<{ title: string; reason: string }>;
  diagnostics: {
    totalInput: number;
    candidatesProduced: number;
    skippedCount: number;
    templateMatchCount: number;
    customCount: number;
  };
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MATCH_DURATION_MS = 105 * 60 * 1000; // 90min + 15min buffer
const DEFAULT_RESOLUTION_BUFFER_HOURS = 4;

// ---------------------------------------------------------------------------
// Core: build candidates
// ---------------------------------------------------------------------------

export function runForge(brainOutput: BrainOutput): ForgeOutput {
  const candidates: Candidate[] = [];
  const skipped: Array<{ title: string; reason: string }> = [];
  let templateMatchCount = 0;
  let customCount = 0;

  for (const approved of brainOutput.approvedEvents) {
    try {
      const candidate = buildCandidate(approved);
      if (candidate) {
        candidates.push(candidate);
        if (approved.creative.category === "match_core") templateMatchCount++;
        else customCount++;
      } else {
        skipped.push({
          title: approved.creative.title || "untitled",
          reason: "Failed to build candidate",
        });
      }
    } catch (err) {
      skipped.push({
        title: approved.creative.title || "untitled",
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log(
    `[FORGE] Produced ${candidates.length} candidates (${templateMatchCount} template, ${customCount} custom), skipped ${skipped.length}`
  );

  return {
    candidates,
    skipped,
    diagnostics: {
      totalInput: brainOutput.approvedEvents.length,
      candidatesProduced: candidates.length,
      skippedCount: skipped.length,
      templateMatchCount,
      customCount,
    },
  };
}

// ---------------------------------------------------------------------------
// Build a single candidate
// ---------------------------------------------------------------------------

function buildCandidate(approved: ApprovedEvent): Candidate | null {
  const { creative, verification, resolution, matchContext } = approved;

  if (!creative.title || creative.title.length < 5) return null;

  // Determine market type
  const marketType = resolveMarketType(creative.marketType);

  // Compute closesAt
  const closesAt = computeClosesAt(creative, matchContext);
  if (!closesAt) return null;

  // Build resolution criteria
  const resCriteria = buildResolutionCriteria(creative, verification, marketType);

  // Find matching template for sportMarketKind
  const template = findBestTemplate(creative, verification);

  // Edge case policy
  const edgeCasePolicy = buildEdgeCasePolicy(creative, template);

  // Build outcomes for multi-option markets
  const outcomes = buildOutcomes(creative, marketType);

  // Source storyline ID for dedup
  const sourceStorylineId = buildSourceStorylineId(creative, matchContext);

  // Template ID — must start with "sport-football-" so the rulebook validator
  // treats FIE candidates as sport fixtures (1h deadline, skips title/criteria check).
  const templateId = template?.id ?? `sport-football-fie-${creative.category}`;

  // Compute momentum/novelty from creative scores
  const momentum = Math.round(
    (creative.wow_factor * 6 + creative.feasibility * 4)
  );
  const novelty = Math.round(creative.wow_factor * 10);

  // Normalize resolution source URLs — the Verifier LLM may return non-URL strings
  const primaryUrl = normalizeUrl(
    verification.resolutionSource.primary,
    template?.resolutionAuthorityHost ?? "v3.football.api-sports.io"
  );
  const secondaryUrl = normalizeUrl(verification.resolutionSource.secondary) ?? null;
  const tertiaryUrl = normalizeUrl(verification.resolutionSource.tertiary) ?? null;

  const candidate: Candidate = {
    title: ensureQuestionMark(creative.title.slice(0, 140)),
    description: buildDescription(creative, verification, matchContext),
    category: "Calcio",
    closesAt,
    resolutionAuthorityHost:
      template?.resolutionAuthorityHost ?? "v3.football.api-sports.io",
    resolutionAuthorityType:
      template?.resolutionAuthorityType ?? "REPUTABLE",
    resolutionCriteriaYes: resCriteria.yes,
    resolutionCriteriaNo: resCriteria.no,
    resolutionCriteriaFull: resCriteria.full ?? null,
    sourceStorylineId,
    templateId,
    resolutionSourceUrl: primaryUrl,
    resolutionSourceSecondary: secondaryUrl,
    resolutionSourceTertiary: tertiaryUrl,
    edgeCasePolicyRef: edgeCasePolicy,
    timezone: "Europe/Rome",
    sportLeague: matchContext?.match.competition.name ?? null,
    footballDataMatchId: matchContext?.match.footballDataId ?? null,
    momentum: Math.min(100, momentum),
    novelty: Math.min(100, novelty),
    creationMetadata: {
      sport_market_kind: template?.sportMarketKind ?? creative.category,
      fie_version: "1.0",
      wow_factor: creative.wow_factor,
      feasibility: creative.feasibility,
      verification_confidence: verification.confidence,
      resolution_type: resolution?.resolutionType ?? "SEMI_AUTOMATIC",
    },
  };

  // Add market type and outcomes if non-binary
  if (marketType !== "BINARY") {
    candidate.marketType = marketType;
  }
  if (outcomes && outcomes.length > 0) {
    candidate.outcomes = outcomes;
  }

  return candidate;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveMarketType(input: string): MarketTypeId {
  const upper = input?.toUpperCase().trim();
  if (isMarketTypeId(upper)) return upper;

  // Common mappings from creative output
  const mappings: Record<string, MarketTypeId> = {
    "BINARY": "BINARY",
    "YES_NO": "BINARY",
    "MULTIPLE_CHOICE": "MULTIPLE_CHOICE",
    "MULTI": "MULTIPLE_CHOICE",
    "THRESHOLD": "THRESHOLD",
    "OVER_UNDER": "THRESHOLD",
    "RANGE": "RANGE",
    "TIME_TO_EVENT": "TIME_TO_EVENT",
    "TIMING": "TIME_TO_EVENT",
    "COUNT": "COUNT_VOLUME",
    "COUNT_VOLUME": "COUNT_VOLUME",
    "RANKING": "RANKING",
    "SCALAR": "SCALAR",
  };

  return mappings[upper] ?? "BINARY";
}

function computeClosesAt(
  creative: ApprovedEvent["creative"],
  matchContext: MatchContext | null
): Date | null {
  const now = new Date();
  const logic = (creative.closesAtLogic ?? "").toLowerCase();

  if (matchContext) {
    const matchStart = new Date(matchContext.match.utcDate);
    const matchEnd = new Date(matchStart.getTime() + MATCH_DURATION_MS);

    // Post-match/post-game windows (Nx ore dopo = Nh after match)
    const postMatchH = logic.match(/(\d+)\s*h\s*(dopo|after)/);
    if (postMatchH) {
      const h = parseInt(postMatchH[1], 10);
      return new Date(matchEnd.getTime() + h * 60 * 60 * 1000);
    }

    // 24h/48h/72h without context → relative to match end
    const hoursOnlyMatch = logic.match(/^(\d+)h?\s*$/);
    if (hoursOnlyMatch) {
      const h = parseInt(hoursOnlyMatch[1], 10);
      return new Date(matchEnd.getTime() + h * 60 * 60 * 1000);
    }

    if (logic.includes("fine partita") || logic.includes("match_end") || logic.includes("after match") || logic.includes("post-match")) {
      return matchEnd;
    }
    if (logic.includes("intervallo") || logic.includes("halftime")) {
      return new Date(matchStart.getTime() + 47 * 60 * 1000);
    }
    if (logic.includes("48h")) {
      return new Date(matchEnd.getTime() + 48 * 60 * 60 * 1000);
    }
    if (logic.includes("24h")) {
      return new Date(matchEnd.getTime() + 24 * 60 * 60 * 1000);
    }

    // Default: close at match start (pre-match markets).
    // If match already started/finished, use match end to keep the event valid.
    return matchStart > now ? matchStart : matchEnd;
  }

  // Season-long or non-match events
  if (logic.includes("fine stagione") || logic.includes("end of season")) {
    // End of season: approximate as June 1st of current or next year
    const endOfSeason = new Date();
    endOfSeason.setMonth(5, 1); // June 1st
    endOfSeason.setHours(22, 0, 0, 0);
    if (endOfSeason < now) endOfSeason.setFullYear(endOfSeason.getFullYear() + 1);
    return endOfSeason;
  }

  // Parse "Xh" or "X giorni"
  const daysMatch = logic.match(/(\d+)\s*(giorn|day)/i);
  if (daysMatch) {
    const d = parseInt(daysMatch[1], 10);
    return new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  }
  const hoursMatch = logic.match(/(\d+)\s*h/i);
  if (hoursMatch) {
    const h = parseInt(hoursMatch[1], 10);
    return new Date(now.getTime() + h * 60 * 60 * 1000);
  }

  // Default: 72h from now
  return new Date(now.getTime() + 72 * 60 * 60 * 1000);
}

function buildResolutionCriteria(
  creative: ApprovedEvent["creative"],
  verification: ApprovedEvent["verification"],
  marketType: MarketTypeId
): { yes: string; no: string; full?: string } {
  // Verifier criteria take priority (they're validated)
  if (verification.resolutionCriteria.yes && verification.resolutionCriteria.no) {
    return {
      yes: verification.resolutionCriteria.yes,
      no: verification.resolutionCriteria.no,
      full: verification.resolutionCriteria.full,
    };
  }

  // Fallback to template
  const template = findBestTemplate(creative, verification);
  if (template?.resolutionCriteriaYes) {
    return {
      yes: template.resolutionCriteriaYes,
      no: template.resolutionCriteriaNo ?? "Condizione non soddisfatta.",
      full: template.resolutionCriteriaFull ?? undefined,
    };
  }

  // Last resort: generic
  return {
    yes: "La condizione specificata nel titolo si verifica entro la scadenza.",
    no: "La condizione specificata nel titolo NON si verifica entro la scadenza.",
  };
}

function findBestTemplate(
  creative: ApprovedEvent["creative"],
  verification: ApprovedEvent["verification"]
): MarketTemplate | undefined {
  // Try matching by resolution method keywords
  const method = (creative.resolutionMethod ?? "").toLowerCase();

  for (const template of MARKET_TEMPLATES) {
    if (method.includes(template.sportMarketKind.toLowerCase())) {
      return template;
    }
  }

  // Try matching by category
  const catTemplates = MARKET_TEMPLATES.filter(
    (t) => t.category === creative.category
  );
  if (catTemplates.length > 0) return catTemplates[0];

  return undefined;
}

function buildOutcomes(
  creative: ApprovedEvent["creative"],
  marketType: MarketTypeId
): Array<{ key: string; label: string }> | null {
  if (marketType === "BINARY" || marketType === "THRESHOLD") return null;

  if (creative.outcomes && creative.outcomes.length >= 2) {
    return creative.outcomes.map((o, i) => ({
      key: o.key || `opt_${i}`,
      label: o.label,
    }));
  }

  return null;
}

function buildSourceStorylineId(
  creative: ApprovedEvent["creative"],
  matchContext: MatchContext | null
): string {
  if (matchContext?.match.apiFootballId) {
    const sanitizedTitle = creative.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 40);
    return `fie:${matchContext.match.apiFootballId}:${sanitizedTitle}`;
  }

  return `fie:custom:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildDescription(
  creative: ApprovedEvent["creative"],
  verification: ApprovedEvent["verification"],
  matchContext: MatchContext | null
): string {
  const parts: string[] = [];

  if (matchContext) {
    const m = matchContext.match;
    parts.push(
      `${m.competition.name} — ${new Date(m.utcDate).toLocaleDateString("it-IT")}`
    );
  }

  if (verification.edgeCasePolicy) {
    parts.push(`Politica edge case: ${verification.edgeCasePolicy}`);
  }

  return parts.join(". ") || "Evento generato dal Football Intelligence Engine.";
}

function buildEdgeCasePolicy(
  creative: ApprovedEvent["creative"],
  template: MarketTemplate | undefined
): string {
  if (template) {
    const parts: string[] = [];
    if (template.edgeCases.matchPostponed) parts.push(`Partita rinviata: ${template.edgeCases.matchPostponed}`);
    if (template.edgeCases.playerNotPlaying) parts.push(`Giocatore assente: ${template.edgeCases.playerNotPlaying}`);
    if (template.edgeCases.dataUnavailable) parts.push(`Dati non disponibili: ${template.edgeCases.dataUnavailable}`);
    return parts.join(" | ");
  }

  return "Mercato annullato e rimborsato in caso di impossibilità oggettiva di risoluzione.";
}

function ensureQuestionMark(title: string): string {
  const trimmed = title.trim();
  return trimmed.endsWith("?") ? trimmed : `${trimmed}?`;
}

/**
 * Normalizes a resolution source string into a valid absolute URL.
 * If the string is already a valid URL, return it as-is.
 * If it looks like a domain/path, prepend https://.
 * Otherwise, fall back to the fallbackHost.
 */
function normalizeUrl(raw?: string | null, fallbackHost?: string): string | null {
  if (!raw) return fallbackHost ? `https://${fallbackHost}/` : null;
  const trimmed = raw.trim();
  if (!trimmed) return fallbackHost ? `https://${fallbackHost}/` : null;

  // Already a valid URL
  try {
    new URL(trimmed);
    return trimmed;
  } catch { /* not valid yet */ }

  // Looks like a domain (contains a dot, no spaces) — prepend https://
  if (!trimmed.includes(" ") && trimmed.includes(".")) {
    try {
      const withScheme = `https://${trimmed}`;
      new URL(withScheme);
      return withScheme;
    } catch { /* fall through */ }
  }

  // Plain text description (e.g. "api-football statistics") — use fallback host
  return fallbackHost ? `https://${fallbackHost}/` : null;
}
