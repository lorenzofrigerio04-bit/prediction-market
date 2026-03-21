/**
 * football-data.org API v4 client.
 * Usato per: calendario partite (fixtures) e risultati per risoluzione automatica.
 * Env: FOOTBALL_DATA_ORG_API_TOKEN (obbligatorio).
 * Doc: https://docs.football-data.org/
 */

const BASE = "https://api.football-data.org/v4";

function getToken(): string {
  const token = process.env.FOOTBALL_DATA_ORG_API_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "FOOTBALL_DATA_ORG_API_TOKEN non configurato. Impostalo in .env (vedi .env.example)."
    );
  }
  return token;
}

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED";

export interface FootballDataTeam {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
}

export interface FootballDataScore {
  home: number | null;
  away: number | null;
}

export interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: MatchStatus;
  homeTeam: FootballDataTeam;
  awayTeam: FootballDataTeam;
  score?: {
    winner?: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    fullTime?: FootballDataScore | null;
    halfTime?: FootballDataScore | null;
    regularTime?: FootballDataScore | null;
    duration?: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT" | null;
  } | null;
  competition?: { id: number; name: string; code: string };
}

interface MatchesResponse {
  matches?: FootballDataMatch[];
}

/**
 * Competizioni abilitate (codici API).
 * Nota: EL (Europa League) è disponibile solo con piano a pagamento football-data.org (Free = 12 competizioni, senza EL).
 */
export const SPORT_COMPETITION_CODES = ["SA", "CL", "EL", "PL", "PD"] as const;

/**
 * Restituisce le partite in un intervallo di date (fixtures + risultati).
 * Filtra: Serie A (SA), Champions League (CL), Europa League (EL), Premier League (PL), La Liga (PD).
 */
export async function fetchMatches(
  dateFrom: string,
  dateTo: string
): Promise<FootballDataMatch[]> {
  const token = getToken();
  const res = await fetch(
    `${BASE}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    {
      headers: {
        "X-Auth-Token": token,
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`football-data.org: ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as MatchesResponse;
  const matches = data.matches ?? [];
  return matches.filter((m) => {
    const code = m.competition?.code;
    return code && SPORT_COMPETITION_CODES.includes(code as (typeof SPORT_COMPETITION_CODES)[number]);
  });
}

/**
 * Restituisce una singola partita per ID (per risoluzione e stato live).
 */
export async function fetchMatchById(
  matchId: number
): Promise<FootballDataMatch | null> {
  const token = getToken();
  const res = await fetch(`${BASE}/matches/${matchId}`, {
    headers: {
      "X-Auth-Token": token,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`football-data.org match ${matchId}: ${res.status} - ${text.slice(0, 200)}`);
  }

  return (await res.json()) as FootballDataMatch;
}

/**
 * Determina l'outcome binario per un evento "Vincerà la squadra di casa?".
 * YES = vittoria casa, NO = pareggio o vittoria ospiti.
 */
export function getBinaryOutcomeFromMatch(
  match: FootballDataMatch
): "YES" | "NO" | null {
  if (match.status !== "FINISHED") return null;
  const winner = match.score?.winner;
  if (winner === "HOME_TEAM") return "YES";
  if (winner === "AWAY_TEAM" || winner === "DRAW") return "NO";
  const ft = match.score?.fullTime;
  if (ft != null && ft.home != null && ft.away != null) {
    if (ft.home > ft.away) return "YES";
    return "NO";
  }
  return null;
}
