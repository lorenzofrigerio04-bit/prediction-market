/**
 * Pipeline generazione eventi da The Odds API.
 * 1. Fetch odds per sport selezionati
 * 2. Filtra eventi futuri, non duplicati
 * 3. Crea Event + Post per ogni evento
 * 4. (Opzionale) Trigger generazione immagini in background
 */

import type { PrismaClient } from "@prisma/client";
import { fetchOddsForSports } from "@/lib/odds/odds-api-client";
import { ODDS_PIPELINE_SPORT_KEYS, SPORT_KEY_TO_CATEGORY } from "./sport-mapping";
import { createEventFromOdds } from "./create-from-odds";

export type OddsPipelineResult = {
  eventsFetched: number;
  created: number;
  skipped: number;
  errors: Array<{ sportKey: string; eventId: string; reason: string }>;
  postIdsForImages: string[];
};

/**
 * Esegue la pipeline: fetch odds → crea eventi da scommesse disponibili.
 */
export async function runOddsEventPipeline(
  prisma: PrismaClient
): Promise<OddsPipelineResult> {
  const result: OddsPipelineResult = {
    eventsFetched: 0,
    created: 0,
    skipped: 0,
    errors: [],
    postIdsForImages: [],
  };

  const sportKeys = [...ODDS_PIPELINE_SPORT_KEYS];
  const oddsBySport = await fetchOddsForSports(sportKeys);

  for (const [sportKey, events] of oddsBySport) {
    const category = SPORT_KEY_TO_CATEGORY[sportKey];
    if (!category) continue;

    result.eventsFetched += events.length;

    for (const ev of events) {
      const createResult = await createEventFromOdds(prisma, ev, category);
      if (createResult.created && createResult.postId) {
        result.created++;
        result.postIdsForImages.push(createResult.postId);
      } else if (createResult.reason === "already_exists" || createResult.reason === "past_event") {
        result.skipped++;
      } else {
        result.errors.push({
          sportKey,
          eventId: ev.id,
          reason: createResult.reason ?? "unknown",
        });
      }
    }
  }

  return result;
}
