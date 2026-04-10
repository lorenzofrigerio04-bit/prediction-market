import OpenAI from "openai";
import type { Candidate } from "@/lib/event-gen-v2/types";
import type { NewsCandidate } from "@/lib/event-sources/types";
import { fetchRSS } from "@/lib/ingestion/fetchers/rss";
import { isOpenAIDisabled } from "@/lib/check-openai-disabled";

const MATCH_DURATION_MINUTES = 90;
const TOTAL_GOALS_OUTCOMES = [
  { key: "goals_0_1", label: "Partita bloccata (0-1 gol)" },
  { key: "goals_2", label: "Ritmo medio (2 gol)" },
  { key: "goals_3", label: "Partita aperta (3 gol)" },
  { key: "goals_4_plus", label: "Partita ad alta intensita (4+ gol)" },
] as const;
const MATCH_SCRIPT_OUTCOMES = [
  { key: "home_statement", label: "Segnale forte squadra casa (2+ gol di scarto)" },
  { key: "balanced_battle", label: "Partita in equilibrio (pareggio o 1 gol di scarto)" },
  { key: "away_statement", label: "Segnale forte squadra ospite (2+ gol di scarto)" },
] as const;
const HALF_TIME_STATE_OUTCOMES = [
  { key: "ht_home_lead", label: "Casa avanti a meta partita" },
  { key: "ht_level", label: "Parita a meta partita" },
  { key: "ht_away_lead", label: "Ospite avanti a meta partita" },
] as const;
const CONTROVERSY_KEYWORDS = [
  "scandalo",
  "inchiesta",
  "squalifica",
  "espulsione",
  "polemica",
  "tensione",
  "ultras",
  "infortunio",
  "var",
  "arbitro",
];
const HYPE_KEYWORDS = [
  "derby",
  "big match",
  "sfida",
  "finale",
  "decisiva",
  "record",
  "rimonta",
  "leader",
];
const MAX_WEB_CONTEXT_FIXTURES = parseInt(process.env.SPORT_MEDIA_CONTEXT_MAX_FIXTURES ?? "24", 10);
const MAX_AI_FIXTURES = parseInt(process.env.SPORT_MEDIA_AI_MAX_FIXTURES ?? "12", 10);
const MEDIA_ARTICLES_LIMIT = parseInt(process.env.SPORT_MEDIA_ARTICLES_PER_FIXTURE ?? "6", 10);
const DEFAULT_MODEL =
  process.env.SPORT_MEDIA_AI_MODEL?.trim() ||
  process.env.GENERATION_MODEL?.trim() ||
  "gpt-4o-mini";

type BinaryMarketKind =
  | "BOTH_TEAMS_TO_SCORE"
  | "MATCH_STAYS_CLOSE"
  | "COMEBACK_SWAP_LEADER"
  | "CLEAN_SHEET_ANY";
type MultiMarketKind =
  | "TOTAL_GOALS_BUCKETS"
  | "MATCH_SCRIPT_3WAY"
  | "HALF_TIME_STATE_3WAY";
type ContextTheme = "injuries" | "coach" | "referee" | "discipline" | "general";

interface EvidenceItem {
  title: string;
  url: string;
  sourceName: string;
}

interface FixtureMediaContext {
  fixture: NewsCandidate;
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  articleCount: number;
  discussionCount: number;
  headlines: string[];
  evidence: EvidenceItem[];
  theme: ContextTheme;
  controversyHits: number;
  hypeHits: number;
}

interface AiNarrativePlan {
  binaryMarketKind?: BinaryMarketKind;
  multiMarketKind?: MultiMarketKind;
  binaryTitle?: string;
  multiTitle?: string;
  descriptionFocus?: string;
  momentum?: number;
  novelty?: number;
}

const BANNED_TERMS = [
  "tipster",
  "bookmaker",
  "quote",
  "quota",
  "scommessa",
  "pronostico",
  "pick",
  "quale copione",
  "livello di intensita",
  "chi vincera",
  "1x2",
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeCount(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
}

function parseFixtureTeams(title: string): { homeTeam: string; awayTeam: string } {
  const parts = title.split(" - ");
  if (parts.length >= 2) {
    return {
      homeTeam: parts[0].trim(),
      awayTeam: parts.slice(1).join(" - ").trim(),
    };
  }
  return { homeTeam: title.trim(), awayTeam: "Squadra ospite" };
}

function closesAtFromFixture(fixture: NewsCandidate): Date {
  const start = new Date(fixture.publishedAt);
  return new Date(start.getTime() + MATCH_DURATION_MINUTES * 60 * 1000);
}

function keywordHits(items: string[], keywords: string[]): number {
  const text = items.join(" ").toLowerCase();
  return keywords.reduce((acc, keyword) => (text.includes(keyword) ? acc + 1 : acc), 0);
}

function computeStorylineScores(ctx: FixtureMediaContext): { momentum: number; novelty: number } {
  const momentum = clamp(
    38 + ctx.articleCount * 7 + ctx.discussionCount * 3 + ctx.hypeHits * 5 + ctx.controversyHits * 4,
    25,
    98
  );
  const novelty = clamp(
    34 + ctx.controversyHits * 10 + Math.min(18, ctx.discussionCount * 3) + Math.min(16, ctx.articleCount * 2),
    25,
    96
  );
  return { momentum, novelty };
}

function buildGoogleNewsRssUrl(homeTeam: string, awayTeam: string, leagueName: string): string {
  const q = `"${homeTeam}" "${awayTeam}" ${leagueName} calcio`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=it&gl=IT&ceid=IT:it`;
}

function buildGoogleContextRssUrl(homeTeam: string, awayTeam: string): string {
  const q =
    `"${homeTeam}" "${awayTeam}" calcio ` +
    `(infortunio OR squalifica OR arbitro OR VAR OR allenatore OR conferenza OR polemica)`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=it&gl=IT&ceid=IT:it`;
}

function buildRedditRssUrl(homeTeam: string, awayTeam: string): string {
  const q = `${homeTeam} ${awayTeam} match thread OR pre match calcio`;
  return `https://www.reddit.com/search.rss?q=${encodeURIComponent(q)}&sort=new&t=week`;
}

function getHostName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "fonte";
  }
}

function dedupeEvidence(items: EvidenceItem[], limit: number): EvidenceItem[] {
  const seen = new Set<string>();
  const out: EvidenceItem[] = [];
  for (const item of items) {
    const key = `${item.title.toLowerCase()}|${item.sourceName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

function detectTheme(evidenceTitles: string[]): ContextTheme {
  const text = evidenceTitles.join(" ").toLowerCase();
  if (/infortun|out|stop|assenz|squalific/.test(text)) return "injuries";
  if (/allenator|tecnico|panchina|esonero|conferenza/.test(text)) return "coach";
  if (/arbitro|var|rigore|direzione/.test(text)) return "referee";
  if (/espulsion|cartellin|squalific|tension|polem/.test(text)) return "discipline";
  return "general";
}

async function fetchFixtureMediaContext(fixture: NewsCandidate): Promise<FixtureMediaContext> {
  const { homeTeam, awayTeam } = parseFixtureTeams(fixture.title);
  const leagueName = fixture.leagueName ?? "Calcio";
  const [newsArticles, contextArticles, redditArticles] = await Promise.all([
    fetchRSS([buildGoogleNewsRssUrl(homeTeam, awayTeam, leagueName)], "RSS_MEDIA"),
    fetchRSS([buildGoogleContextRssUrl(homeTeam, awayTeam)], "RSS_MEDIA"),
    fetchRSS([buildRedditRssUrl(homeTeam, awayTeam)], "RSS_MEDIA"),
  ]);

  const evidence = dedupeEvidence(
    [...newsArticles, ...contextArticles]
      .map((a) => ({
        title: a.title?.trim() ?? "",
        url: a.url,
        sourceName: getHostName(a.url),
      }))
      .filter((e) => e.title.length > 0 && e.url.length > 0),
    normalizeCount(MEDIA_ARTICLES_LIMIT, 6)
  );
  const headlines = evidence.map((e) => e.title);
  const discussionHeadlines = redditArticles
    .map((a) => a.title?.trim())
    .filter((title): title is string => Boolean(title))
    .slice(0, 4);
  const allSignals = [...headlines, ...discussionHeadlines];

  return {
    fixture,
    homeTeam,
    awayTeam,
    leagueName,
    articleCount: headlines.length,
    discussionCount: discussionHeadlines.length,
    headlines: allSignals.slice(0, 8),
    evidence,
    theme: detectTheme(allSignals),
    controversyHits: keywordHits(allSignals, CONTROVERSY_KEYWORDS),
    hypeHits: keywordHits(allSignals, HYPE_KEYWORDS),
  };
}

function safeParseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const direct = JSON.parse(raw);
    if (direct && typeof direct === "object") return direct as Record<string, unknown>;
  } catch {
    // ignore
  }
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
  } catch {
    // ignore
  }
  return null;
}

function asBinaryKind(value: unknown): BinaryMarketKind | undefined {
  if (
    value === "BOTH_TEAMS_TO_SCORE" ||
    value === "MATCH_STAYS_CLOSE" ||
    value === "COMEBACK_SWAP_LEADER" ||
    value === "CLEAN_SHEET_ANY"
  ) {
    return value;
  }
  return undefined;
}

function asMultiKind(value: unknown): MultiMarketKind | undefined {
  if (
    value === "TOTAL_GOALS_BUCKETS" ||
    value === "MATCH_SCRIPT_3WAY" ||
    value === "HALF_TIME_STATE_3WAY"
  ) {
    return value;
  }
  return undefined;
}

function addQuestionMark(text: string): string {
  return text.endsWith("?") ? text : `${text}?`;
}

function sanitizeTitle(raw: string, fallback: string): string {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  if (!cleaned) return addQuestionMark(fallback);
  const lower = cleaned.toLowerCase();
  if (
    BANNED_TERMS.some((term) => lower.includes(term)) ||
    lower.startsWith("chi vinc") ||
    lower.includes("quale copione") ||
    lower.includes("livello di intensita")
  ) {
    return addQuestionMark(fallback);
  }
  return addQuestionMark(cleaned.slice(0, 140));
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickTemplate(templates: string[], seed: string): string {
  if (templates.length === 0) return "";
  return templates[hashString(seed) % templates.length];
}

function buildContextDescription(ctx: FixtureMediaContext, focus?: string): string {
  const evidenceText = ctx.evidence
    .slice(0, 2)
    .map((e) => `"${e.title}" (${e.sourceName})`)
    .join("; ");
  if (focus && focus.trim().length > 0) {
    return `${focus.trim()} Evidenze: ${evidenceText || "nessuna evidenza forte"}.`;
  }
  return `Contesto monitorato: ${ctx.articleCount} notizie e ${ctx.discussionCount} discussioni. Evidenze: ${evidenceText || "nessuna evidenza forte"}.`;
}

function pickDiversifiedKind<T extends string>(
  preferred: T,
  available: readonly T[],
  counters: Map<T, number>
): T {
  let minCount = Number.POSITIVE_INFINITY;
  for (const kind of available) minCount = Math.min(minCount, counters.get(kind) ?? 0);
  const preferredCount = counters.get(preferred) ?? 0;
  if (preferredCount <= minCount + 1) {
    counters.set(preferred, preferredCount + 1);
    return preferred;
  }
  let selected = available[0];
  let selectedCount = counters.get(selected) ?? 0;
  for (const kind of available) {
    const count = counters.get(kind) ?? 0;
    if (count < selectedCount) {
      selected = kind;
      selectedCount = count;
    }
  }
  counters.set(selected, selectedCount + 1);
  return selected;
}

function computeDefaultBinaryKind(ctx: FixtureMediaContext, matchId: number | null): BinaryMarketKind {
  if (ctx.theme === "injuries") return "CLEAN_SHEET_ANY";
  if (ctx.theme === "referee" || ctx.theme === "discipline") return "COMEBACK_SWAP_LEADER";
  if (ctx.hypeHits >= 2) return "BOTH_TEAMS_TO_SCORE";
  if (ctx.discussionCount >= 2) return "MATCH_STAYS_CLOSE";
  return (matchId ?? 0) % 2 === 0 ? "MATCH_STAYS_CLOSE" : "BOTH_TEAMS_TO_SCORE";
}

function computeDefaultMultiKind(ctx: FixtureMediaContext, matchId: number | null): MultiMarketKind {
  if (ctx.theme === "coach") return "HALF_TIME_STATE_3WAY";
  if (ctx.hypeHits >= 2) return "MATCH_SCRIPT_3WAY";
  if (ctx.controversyHits >= 2) return "HALF_TIME_STATE_3WAY";
  return (matchId ?? 0) % 2 === 0 ? "TOTAL_GOALS_BUCKETS" : "MATCH_SCRIPT_3WAY";
}

async function buildAiNarrativePlan(ctx: FixtureMediaContext): Promise<AiNarrativePlan | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || isOpenAIDisabled()) return null;
  const client = new OpenAI({ apiKey });
  const evidenceLines = ctx.evidence
    .slice(0, 6)
    .map((e, i) => `${i + 1}. ${e.title} | ${e.sourceName} | ${e.url}`)
    .join("\n");
  const prompt = [
    "Sei un market strategist per prediction market sportivi (stile Polymarket/Kalshi, non bookmaker).",
    "Obiettivo: creare domande originali e specifiche per questa partita.",
    "Vincoli hard:",
    "- vietato gergo betting: quote, tipster, pick, bookmaker, pronostico.",
    "- vietato pattern: 'chi vincera', 'quale copione descrive', 'quale livello di intensita'.",
    "- usa il contesto notizie per rendere le domande uniche.",
    "Rispondi solo in JSON:",
    "{",
    '  "binaryMarketKind": "BOTH_TEAMS_TO_SCORE|MATCH_STAYS_CLOSE|COMEBACK_SWAP_LEADER|CLEAN_SHEET_ANY",',
    '  "multiMarketKind": "TOTAL_GOALS_BUCKETS|MATCH_SCRIPT_3WAY|HALF_TIME_STATE_3WAY",',
    '  "binaryTitle": "domanda max 120 chars",',
    '  "multiTitle": "domanda max 120 chars",',
    '  "descriptionFocus": "max 2 frasi basate su evidenze",',
    '  "momentum": numero 0-100,',
    '  "novelty": numero 0-100',
    "}",
    `Match: ${ctx.homeTeam} vs ${ctx.awayTeam}`,
    `Competizione: ${ctx.leagueName}`,
    `Tema dominante: ${ctx.theme}`,
    `Notizie: ${ctx.articleCount}, Discussioni: ${ctx.discussionCount}`,
    "Evidenze:",
    evidenceLines || "- Nessuna evidenza",
  ].join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.35,
      max_tokens: 700,
      messages: [
        { role: "system", content: "Restituisci esclusivamente JSON valido." },
        { role: "user", content: prompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    const parsed = safeParseJsonObject(raw);
    if (!parsed) return null;
    return {
      binaryMarketKind: asBinaryKind(parsed.binaryMarketKind),
      multiMarketKind: asMultiKind(parsed.multiMarketKind),
      binaryTitle: typeof parsed.binaryTitle === "string" ? parsed.binaryTitle.trim() : undefined,
      multiTitle: typeof parsed.multiTitle === "string" ? parsed.multiTitle.trim() : undefined,
      descriptionFocus:
        typeof parsed.descriptionFocus === "string" ? parsed.descriptionFocus.trim() : undefined,
      momentum: typeof parsed.momentum === "number" ? clamp(parsed.momentum, 0, 100) : undefined,
      novelty: typeof parsed.novelty === "number" ? clamp(parsed.novelty, 0, 100) : undefined,
    };
  } catch (error) {
    console.warn("[sport-media-agent] AI plan failed:", error);
    return null;
  }
}

function defaultBinaryTitle(ctx: FixtureMediaContext, marketKind: BinaryMarketKind): string {
  const seed = `${ctx.homeTeam}-${ctx.awayTeam}-${ctx.theme}-${marketKind}`;
  if (marketKind === "MATCH_STAYS_CLOSE") {
    return pickTemplate(
      [
        `${ctx.homeTeam} - ${ctx.awayTeam} si deciderà con al massimo un gol di scarto`,
        `La sfida ${ctx.homeTeam} - ${ctx.awayTeam} resterà in equilibrio fino al finale`,
      ],
      seed
    );
  }
  if (marketKind === "COMEBACK_SWAP_LEADER") {
    return pickTemplate(
      [
        `In ${ctx.homeTeam} - ${ctx.awayTeam} vedremo un cambio leader tra intervallo e finale`,
        `La squadra avanti all'intervallo in ${ctx.homeTeam} - ${ctx.awayTeam} non vincerà la partita`,
      ],
      seed
    );
  }
  if (marketKind === "CLEAN_SHEET_ANY") {
    return pickTemplate(
      [
        `Almeno una difesa resterà imbattuta in ${ctx.homeTeam} - ${ctx.awayTeam}`,
        `In ${ctx.homeTeam} - ${ctx.awayTeam} una squadra chiuderà senza subire gol`,
      ],
      seed
    );
  }
  return pickTemplate(
    [
      `Entrambe le squadre segneranno in ${ctx.homeTeam} - ${ctx.awayTeam}`,
      `${ctx.homeTeam} - ${ctx.awayTeam}: vedremo gol da entrambe le parti`,
    ],
    seed
  );
}

function defaultMultiTitle(ctx: FixtureMediaContext, marketKind: MultiMarketKind): string {
  const seed = `${ctx.homeTeam}-${ctx.awayTeam}-${ctx.theme}-${marketKind}`;
  if (marketKind === "MATCH_SCRIPT_3WAY") {
    return pickTemplate(
      [
        `Esito strategico finale di ${ctx.homeTeam} - ${ctx.awayTeam}`,
        `Come si chiuderà davvero ${ctx.homeTeam} - ${ctx.awayTeam}`,
      ],
      seed
    );
  }
  if (marketKind === "HALF_TIME_STATE_3WAY") {
    return pickTemplate(
      [
        `Situazione all'intervallo in ${ctx.homeTeam} - ${ctx.awayTeam}`,
        `Chi avrà il controllo a metà partita in ${ctx.homeTeam} - ${ctx.awayTeam}`,
      ],
      seed
    );
  }
  return pickTemplate(
    [
      `Quanta produzione offensiva ci sarà in ${ctx.homeTeam} - ${ctx.awayTeam}`,
      `Fascia gol finale per ${ctx.homeTeam} - ${ctx.awayTeam}`,
    ],
    seed
  );
}

function buildBinaryCandidate(
  ctx: FixtureMediaContext,
  marketKind: BinaryMarketKind,
  plan: AiNarrativePlan | null
): Candidate {
  const closesAt = closesAtFromFixture(ctx.fixture);
  const matchId = ctx.fixture.footballDataMatchId ?? null;
  const baseDescription = buildContextDescription(ctx, plan?.descriptionFocus);
  const scores = computeStorylineScores(ctx);
  const momentum = plan?.momentum ?? scores.momentum;
  const novelty = plan?.novelty ?? scores.novelty;
  const fallbackTitle = defaultBinaryTitle(ctx, marketKind);
  const common = {
    description: baseDescription,
    category: "Calcio",
    closesAt,
    resolutionAuthorityHost: "api.football-data.org",
    resolutionAuthorityType: "REPUTABLE",
    resolutionSourceUrl: ctx.fixture.url,
    resolutionSourceSecondary: ctx.evidence[0]?.url ?? null,
    resolutionSourceTertiary: ctx.evidence[1]?.url ?? null,
    timezone: "Europe/Rome",
    sportLeague: ctx.fixture.leagueName ?? null,
    footballDataMatchId: matchId,
    momentum,
    novelty,
  } as const;

  if (marketKind === "MATCH_STAYS_CLOSE") {
    return {
      title: sanitizeTitle(plan?.binaryTitle ?? fallbackTitle, fallbackTitle),
      ...common,
      resolutionCriteriaYes:
        "Al termine, la differenza reti assoluta tra le due squadre e minore o uguale a 1.",
      resolutionCriteriaNo:
        "Al termine, la differenza reti assoluta tra le due squadre e maggiore o uguale a 2.",
      sourceStorylineId:
        matchId != null ? `football-data:${matchId}:match-close` : `${ctx.fixture.url}#match-close`,
      templateId: "sport-football-match-close",
      creationMetadata: { sport_market_kind: "MATCH_STAYS_CLOSE", media_article_count: ctx.articleCount },
    };
  }
  if (marketKind === "COMEBACK_SWAP_LEADER") {
    return {
      title: sanitizeTitle(plan?.binaryTitle ?? fallbackTitle, fallbackTitle),
      ...common,
      resolutionCriteriaYes:
        "La squadra in vantaggio a meta partita non coincide con la squadra vincente a fine gara.",
      resolutionCriteriaNo:
        "La squadra in vantaggio a meta partita vince anche la gara, oppure non c'e una coppia di leader valida.",
      sourceStorylineId:
        matchId != null ? `football-data:${matchId}:comeback-swap` : `${ctx.fixture.url}#comeback-swap`,
      templateId: "sport-football-comeback-swap",
      creationMetadata: {
        sport_market_kind: "COMEBACK_SWAP_LEADER",
        media_article_count: ctx.articleCount,
      },
    };
  }
  if (marketKind === "CLEAN_SHEET_ANY") {
    return {
      title: sanitizeTitle(plan?.binaryTitle ?? fallbackTitle, fallbackTitle),
      ...common,
      resolutionCriteriaYes: "A fine gara almeno una squadra ha subito 0 gol (home=0 oppure away=0).",
      resolutionCriteriaNo: "A fine gara entrambe le squadre hanno segnato almeno 1 gol.",
      sourceStorylineId:
        matchId != null ? `football-data:${matchId}:clean-sheet-any` : `${ctx.fixture.url}#clean-sheet-any`,
      templateId: "sport-football-clean-sheet-any",
      creationMetadata: { sport_market_kind: "CLEAN_SHEET_ANY", media_article_count: ctx.articleCount },
    };
  }
  return {
    title: sanitizeTitle(plan?.binaryTitle ?? fallbackTitle, fallbackTitle),
    ...common,
    resolutionCriteriaYes:
      "Sia squadra casa che squadra ospite segnano almeno 1 gol nel risultato finale.",
    resolutionCriteriaNo: "Almeno una delle due squadre termina la partita con 0 gol segnati.",
    sourceStorylineId: matchId != null ? `football-data:${matchId}:btts` : `${ctx.fixture.url}#btts`,
    templateId: "sport-football-btts",
    creationMetadata: { sport_market_kind: "BOTH_TEAMS_TO_SCORE", media_article_count: ctx.articleCount },
  };
}

function buildMultiCandidate(
  ctx: FixtureMediaContext,
  marketKind: MultiMarketKind,
  plan: AiNarrativePlan | null
): Candidate {
  const closesAt = closesAtFromFixture(ctx.fixture);
  const matchId = ctx.fixture.footballDataMatchId ?? null;
  const baseDescription = buildContextDescription(ctx, plan?.descriptionFocus);
  const scores = computeStorylineScores(ctx);
  const momentum = plan?.momentum ?? scores.momentum;
  const novelty = plan?.novelty ?? scores.novelty;
  const fallbackTitle = defaultMultiTitle(ctx, marketKind);
  const common = {
    description: baseDescription,
    category: "Calcio",
    closesAt,
    resolutionAuthorityHost: "api.football-data.org",
    resolutionAuthorityType: "REPUTABLE",
    resolutionCriteriaYes: "",
    resolutionCriteriaNo: "",
    marketType: "MULTIPLE_CHOICE",
    resolutionSourceUrl: ctx.fixture.url,
    resolutionSourceSecondary: ctx.evidence[0]?.url ?? null,
    resolutionSourceTertiary: ctx.evidence[1]?.url ?? null,
    timezone: "Europe/Rome",
    sportLeague: ctx.fixture.leagueName ?? null,
    footballDataMatchId: matchId,
    momentum,
    novelty,
  } as const;

  if (marketKind === "MATCH_SCRIPT_3WAY") {
    return {
      title: sanitizeTitle(plan?.multiTitle ?? fallbackTitle, fallbackTitle),
      ...common,
      resolutionCriteriaFull:
        "Differenza reti finale >= 2 casa => home_statement; <= -2 => away_statement; altrimenti => balanced_battle.",
      outcomes: [...MATCH_SCRIPT_OUTCOMES],
      sourceStorylineId:
        matchId != null ? `football-data:${matchId}:match-script` : `${ctx.fixture.url}#match-script`,
      templateId: "sport-football-match-script",
      creationMetadata: { sport_market_kind: "MATCH_SCRIPT_3WAY", media_article_count: ctx.articleCount },
    };
  }
  if (marketKind === "HALF_TIME_STATE_3WAY") {
    return {
      title: sanitizeTitle(plan?.multiTitle ?? fallbackTitle, fallbackTitle),
      ...common,
      resolutionCriteriaFull:
        "Usare score halfTime. home>away => ht_home_lead; home=away => ht_level; home<away => ht_away_lead.",
      outcomes: [...HALF_TIME_STATE_OUTCOMES],
      sourceStorylineId:
        matchId != null
          ? `football-data:${matchId}:half-time-state`
          : `${ctx.fixture.url}#half-time-state`,
      templateId: "sport-football-half-time-state",
      creationMetadata: {
        sport_market_kind: "HALF_TIME_STATE_3WAY",
        media_article_count: ctx.articleCount,
      },
    };
  }
  return {
    title: sanitizeTitle(plan?.multiTitle ?? fallbackTitle, fallbackTitle),
    ...common,
    resolutionCriteriaFull:
      "Sommare i gol finali (fullTime). 0-1 => goals_0_1; 2 => goals_2; 3 => goals_3; 4+ => goals_4_plus.",
    outcomes: [...TOTAL_GOALS_OUTCOMES],
    sourceStorylineId:
      matchId != null ? `football-data:${matchId}:total-goals` : `${ctx.fixture.url}#total-goals`,
    templateId: "sport-football-total-goals",
    creationMetadata: { sport_market_kind: "TOTAL_GOALS_BUCKETS", media_article_count: ctx.articleCount },
  };
}

async function mapWithConcurrency<T, R>(
  values: T[],
  limit: number,
  mapper: (value: T, index: number) => Promise<R>
): Promise<R[]> {
  const safeLimit = Math.max(1, limit);
  const results: R[] = new Array(values.length);
  let currentIndex = 0;
  async function worker(): Promise<void> {
    while (currentIndex < values.length) {
      const index = currentIndex;
      currentIndex += 1;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(safeLimit, values.length) }, () => worker()));
  return results;
}

export async function buildSportMediaAwareCandidates(fixtures: NewsCandidate[]): Promise<Candidate[]> {
  if (fixtures.length === 0) return [];

  const contextCap = normalizeCount(MAX_WEB_CONTEXT_FIXTURES, 24);
  const aiCap = normalizeCount(MAX_AI_FIXTURES, 12);
  const contexts = await mapWithConcurrency(fixtures.slice(0, contextCap), 4, async (fixture) => {
    try {
      return await fetchFixtureMediaContext(fixture);
    } catch (error) {
      console.warn("[sport-media-agent] Web context failed:", error);
      const teams = parseFixtureTeams(fixture.title);
      return {
        fixture,
        homeTeam: teams.homeTeam,
        awayTeam: teams.awayTeam,
        leagueName: fixture.leagueName ?? "Calcio",
        articleCount: 0,
        discussionCount: 0,
        headlines: [],
        evidence: [],
        theme: "general",
        controversyHits: 0,
        hypeHits: 0,
      } satisfies FixtureMediaContext;
    }
  });

  const contextsByMatchId = new Map<number, FixtureMediaContext>();
  const contextsByUrl = new Map<string, FixtureMediaContext>();
  for (const ctx of contexts) {
    if (ctx.fixture.footballDataMatchId != null) {
      contextsByMatchId.set(ctx.fixture.footballDataMatchId, ctx);
    }
    contextsByUrl.set(ctx.fixture.url, ctx);
  }

  const binaryKinds = [
    "BOTH_TEAMS_TO_SCORE",
    "MATCH_STAYS_CLOSE",
    "COMEBACK_SWAP_LEADER",
    "CLEAN_SHEET_ANY",
  ] as const;
  const multiKinds = [
    "TOTAL_GOALS_BUCKETS",
    "MATCH_SCRIPT_3WAY",
    "HALF_TIME_STATE_3WAY",
  ] as const;
  const binaryCounters = new Map<BinaryMarketKind, number>();
  const multiCounters = new Map<MultiMarketKind, number>();
  const candidates: Candidate[] = [];

  for (let idx = 0; idx < fixtures.length; idx += 1) {
    const fixture = fixtures[idx];
    const teams = parseFixtureTeams(fixture.title);
    const fallbackContext: FixtureMediaContext = {
      fixture,
      homeTeam: teams.homeTeam,
      awayTeam: teams.awayTeam,
      leagueName: fixture.leagueName ?? "Calcio",
      articleCount: 0,
      discussionCount: 0,
      headlines: [],
      evidence: [],
      theme: "general",
      controversyHits: 0,
      hypeHits: 0,
    };
    const ctx =
      (fixture.footballDataMatchId != null && contextsByMatchId.get(fixture.footballDataMatchId)) ||
      contextsByUrl.get(fixture.url) ||
      fallbackContext;

    let plan: AiNarrativePlan | null = null;
    if (idx < aiCap && (ctx.articleCount > 0 || ctx.discussionCount > 0)) {
      plan = await buildAiNarrativePlan(ctx);
    }

    const preferredBinary =
      plan?.binaryMarketKind || computeDefaultBinaryKind(ctx, fixture.footballDataMatchId ?? null);
    const preferredMulti =
      plan?.multiMarketKind || computeDefaultMultiKind(ctx, fixture.footballDataMatchId ?? null);
    const selectedBinary = pickDiversifiedKind(preferredBinary, binaryKinds, binaryCounters);
    const selectedMulti = pickDiversifiedKind(preferredMulti, multiKinds, multiCounters);

    candidates.push(buildBinaryCandidate(ctx, selectedBinary, plan));
    candidates.push(buildMultiCandidate(ctx, selectedMulti, plan));
  }

  return candidates;
}
