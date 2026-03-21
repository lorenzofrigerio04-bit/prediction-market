/**
 * football-data.org – calendario partite (fixtures) per pipeline Sport.
 * Unica fonte per categoria Calcio: calendario + risultati (risoluzione automatica).
 * Env: FOOTBALL_DATA_ORG_API_TOKEN.
 */

import type { NewsCandidate } from "./types";
import { fetchMatches } from "@/lib/football-data-org/client";

const FIXTURES_DAYS = 7;
const MAX_FIXTURES = 50;

/**
 * Restituisce le prossime partite di calcio (stato SCHEDULED o TIMED) come NewsCandidate.
 * Include footballDataMatchId per risoluzione e aggiornamento stato (live).
 */
export async function fetchFootballFixturesFootballDataOrg(
  limit: number = MAX_FIXTURES
): Promise<NewsCandidate[]> {
  const now = new Date();
  const dateFrom = now.toISOString().slice(0, 10);
  const to = new Date(now);
  to.setDate(to.getDate() + FIXTURES_DAYS);
  const dateTo = to.toISOString().slice(0, 10);

  const matches = await fetchMatches(dateFrom, dateTo);
  const scheduled = matches.filter(
    (m) => m.status === "SCHEDULED" || m.status === "TIMED"
  );

  const candidates: NewsCandidate[] = scheduled.slice(0, limit).map((m) => {
    const home = m.homeTeam.name;
    const away = m.awayTeam.name;
    const title = `${home} - ${away}`;
    const utcDate = new Date(m.utcDate);
    const leagueName = m.competition?.name ?? "Calcio";
    return {
      title,
      snippet: `${utcDate.toLocaleDateString("it-IT")} ${utcDate.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })} • ${leagueName}`.trim(),
      url: `https://www.football-data.org/match/${m.id}`,
      sourceName: "football-data.org",
      publishedAt: m.utcDate,
      rawCategory: "Calcio",
      leagueName,
      footballDataMatchId: m.id,
    };
  });

  candidates.sort(
    (a, b) =>
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );
  return candidates;
}
