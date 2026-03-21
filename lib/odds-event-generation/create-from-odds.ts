/**
 * Crea Event + Post da evento The Odds API.
 * Nessun LLM: titolo deterministico da home_team/away_team.
 */

import type { PrismaClient } from "@prisma/client";
import type { OddsApiEvent, OddsApiBookmaker } from "@/lib/odds/odds-api-client";
import { getEventGeneratorUserId } from "@/lib/event-utils";
import { getOrCreateBotUsers } from "@/lib/simulated-activity/bot-users";
import { getBParameter } from "@/lib/pricing/initialization";
import { getBufferHoursForCategory } from "@/lib/markets";
import { ensureAmmStateForEvent } from "@/lib/amm/ensure-amm-state";
import { SPORT_KEY_TO_CATEGORY } from "./sport-mapping";

const RESOLUTION_SOURCE_URL = "https://www.legaseriea.it/it/serie-a/calendario-e-risultati";
const RESOLUTION_NOTES = "Risultato ufficiale alla fine dell'incontro.";

export type BestBookmaker = {
  key: string;
  title: string;
  yesPrice: number;
  noPrice: number;
};

function extractH2hPrices(
  bookmaker: OddsApiBookmaker,
  homeTeam: string,
  awayTeam: string
): { yesPrice: number; noPrice: number } | null {
  const h2h = bookmaker.markets.find((m) => m.key === "h2h");
  if (!h2h?.outcomes?.length) return null;

  const homeOutcome = h2h.outcomes.find(
    (o) => o.name.toLowerCase() === homeTeam.toLowerCase()
  );
  const awayOutcome = h2h.outcomes.find(
    (o) => o.name.toLowerCase() === awayTeam.toLowerCase()
  );
  const drawOutcome = h2h.outcomes.find(
    (o) => o.name.toLowerCase() === "draw"
  );

  if (!homeOutcome) return null;

  const noPrices: number[] = [];
  if (awayOutcome) noPrices.push(awayOutcome.price);
  if (drawOutcome) noPrices.push(drawOutcome.price);
  const noPrice = noPrices.length > 0 ? Math.max(...noPrices) : 0;

  return { yesPrice: homeOutcome.price, noPrice };
}

/**
 * Calcola il bookmaker con le quote più profittevoli (max yesPrice).
 */
export function getBestBookmaker(ev: OddsApiEvent): BestBookmaker | null {
  const { home_team, away_team, bookmakers } = ev;
  let best: BestBookmaker | null = null;

  for (const bm of bookmakers) {
    const prices = extractH2hPrices(bm, home_team, away_team);
    if (!prices) continue;
    if (!best || prices.yesPrice > best.yesPrice) {
      best = {
        key: bm.key,
        title: bm.title,
        yesPrice: prices.yesPrice,
        noPrice: prices.noPrice,
      };
    }
  }
  return best;
}

/**
 * Formatta titolo: "Il [home] vincerà contro il [away]?"
 */
function formatTitle(homeTeam: string, awayTeam: string): string {
  const h = homeTeam.trim();
  const a = awayTeam.trim();
  return `Il ${h} vincerà contro il ${a}?`;
}

export type CreateFromOddsResult = {
  created: boolean;
  eventId?: string;
  postId?: string;
  reason?: string;
};

/**
 * Crea Event + Post da evento Odds API. Ritorna created: false se già esistente.
 */
export async function createEventFromOdds(
  prisma: PrismaClient,
  ev: OddsApiEvent,
  category: string
): Promise<CreateFromOddsResult> {
  const dedupKey = `odds:${ev.id}`;
  const existing = await prisma.event.findUnique({
    where: { dedupKey },
    select: { id: true },
  });
  if (existing) {
    return { created: false, reason: "already_exists" };
  }

  const commenceTime = new Date(ev.commence_time);
  const now = new Date();
  if (commenceTime <= now) {
    return { created: false, reason: "past_event" };
  }

  const best = getBestBookmaker(ev);
  if (!best) {
    return { created: false, reason: "no_odds" };
  }

  const resolutionBufferHours = getBufferHoursForCategory(category);
  const closesAt = new Date(
    commenceTime.getTime() - resolutionBufferHours * 60 * 60 * 1000
  );

  const title = formatTitle(ev.home_team, ev.away_team);
  const description = `Partita ${ev.sport_title}: ${ev.home_team} vs ${ev.away_team}. Esito verificabile a fine incontro.`;

  const creatorId = await getEventGeneratorUserId(prisma);
  const bots = await getOrCreateBotUsers(prisma, 1);
  const botUserId = bots[0]?.id ?? creatorId;

  const b = getBParameter(category as "Calcio" | "Tennis" | "Pallacanestro", "Medium");

  const event = await prisma.event.create({
    data: {
      title,
      description,
      category,
      closesAt,
      resolutionSourceUrl: RESOLUTION_SOURCE_URL,
      resolutionNotes: RESOLUTION_NOTES,
      createdById: creatorId,
      b,
      resolutionBufferHours,
      dedupKey,
      tradingMode: "AMM",
      sourceType: "ODDS_API",
      oddsApiEventId: ev.id,
      bestBookmakerKey: best.key,
      bestBookmakerTitle: best.title,
      bestYesOdds: best.yesPrice,
      bestNoOdds: best.noPrice,
    },
  });

  await ensureAmmStateForEvent(prisma, event.id);

  const post = await prisma.post.create({
    data: {
      userId: botUserId,
      eventId: event.id,
      content: `${title} Scommetti con le migliori quote.`,
      type: "AI_IMAGE",
      source: "BOT",
      hidden: false,
    },
  });

  return {
    created: true,
    eventId: event.id,
    postId: post.id,
  };
}
