export interface PricePoint {
  date: string;
  value: number;
}

export interface PlayerStats {
  matches: number;
  goals: number;
  assists: number;
  motm: number;
}

export type Volatility = "high" | "medium" | "low";
export type Position = "Attaccante" | "Centrocampo" | "Difesa" | "Portiere";
export type Competition = "Serie A" | "Premier League" | "La Liga" | "Champions League";

export interface Market {
  id: string;
  question: string;
  yesPct: number;
  yesOdds: number;
  noOdds: number;
  bets: number;
  closingTime: string; // ISO string
  event?: string;
  eventDate?: string;
  isHot?: boolean;
}

export interface PlayerToken {
  id: string;
  name: string;
  team: string;
  competition: Competition;
  position: Position;
  nationality: string;
  photo?: string;
  currentValue: number;
  change24h: number;
  change7d: number;
  change30d: number;
  volatility: Volatility;
  holders: number;
  stats: PlayerStats;
  priceHistory: PricePoint[];
  markets: Market[];
  isHot?: boolean;
}

function generateHistory(
  baseValue: number,
  change30d: number,
  numPoints = 30
): PricePoint[] {
  const now = new Date();
  const points: PricePoint[] = [];
  const startValue = baseValue / (1 + change30d / 100);
  for (let i = numPoints - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const progress = (numPoints - 1 - i) / (numPoints - 1);
    const trend = startValue + (baseValue - startValue) * progress;
    const noise = (Math.sin(i * 2.3) * 0.4 + Math.cos(i * 1.7) * 0.3) * (baseValue * 0.025);
    points.push({
      date: d.toISOString().split("T")[0],
      value: Math.max(0.5, parseFloat((trend + noise).toFixed(2))),
    });
  }
  points[points.length - 1].value = baseValue;
  return points;
}

function makeClosingTime(hoursFromNow: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d.toISOString();
}

export const MOCK_PLAYER_TOKENS: PlayerToken[] = [
  {
    id: "lautaro-martinez",
    name: "Lautaro Martinez",
    team: "Inter",
    competition: "Serie A",
    position: "Attaccante",
    nationality: "ARG",
    photo: "/players/lautaro-martinez.png",
    currentValue: 24.3,
    change24h: 2.1,
    change7d: 8.5,
    change30d: 14.2,
    volatility: "medium",
    holders: 8900,
    isHot: true,
    stats: { matches: 28, goals: 18, assists: 6, motm: 7 },
    priceHistory: generateHistory(24.3, 14.2),
    markets: [
      {
        id: "lautaro-m1",
        question: "Token Lautaro supererà €25 dopo Inter vs Napoli?",
        yesPct: 67,
        yesOdds: 1.49,
        noOdds: 2.94,
        bets: 3200,
        closingTime: makeClosingTime(14),
        event: "Inter vs Napoli",
        eventDate: "Dom 20:45",
        isHot: true,
      },
    ],
  },
  {
    id: "victor-osimhen",
    name: "Victor Osimhen",
    team: "Napoli",
    competition: "Serie A",
    position: "Attaccante",
    nationality: "NGA",
    photo: "/players/victor-osimhen.png",
    currentValue: 35.8,
    change24h: -1.5,
    change7d: 3.2,
    change30d: 22.0,
    volatility: "high",
    holders: 11200,
    isHot: true,
    stats: { matches: 25, goals: 21, assists: 4, motm: 9 },
    priceHistory: generateHistory(35.8, 22.0),
    markets: [
      {
        id: "osimhen-m1",
        question: "Osimhen segnerà e token salirà >5% dopo Napoli vs Milan?",
        yesPct: 52,
        yesOdds: 1.92,
        noOdds: 2.08,
        bets: 4200,
        closingTime: makeClosingTime(4),
        event: "Napoli vs Milan",
        eventDate: "Dom 15:00",
        isHot: true,
      },
    ],
  },
  {
    id: "khvicha-kvaratskhelia",
    name: "Khvicha Kvaratskhelia",
    team: "Napoli",
    competition: "Serie A",
    position: "Attaccante",
    nationality: "GEO",
    photo: "/players/khvicha-kvaratskhelia.png",
    currentValue: 18.75,
    change24h: 15.2,
    change7d: 18.9,
    change30d: 31.5,
    volatility: "high",
    holders: 7600,
    isHot: true,
    stats: { matches: 27, goals: 12, assists: 10, motm: 6 },
    priceHistory: generateHistory(18.75, 31.5),
    markets: [
      {
        id: "kvara-m1",
        question: "Token Kvara supererà €20 dopo Napoli vs Juventus?",
        yesPct: 58,
        yesOdds: 1.72,
        noOdds: 2.38,
        bets: 5500,
        closingTime: makeClosingTime(26),
        event: "Napoli vs Juventus",
        eventDate: "Dom 20:45",
        isHot: true,
      },
    ],
  },
  {
    id: "rafael-leao",
    name: "Rafael Leão",
    team: "Milan",
    competition: "Serie A",
    position: "Attaccante",
    nationality: "POR",
    photo: "/players/rafael-leao.png",
    currentValue: 29.4,
    change24h: -2.3,
    change7d: -4.1,
    change30d: 5.8,
    volatility: "medium",
    holders: 9400,
    stats: { matches: 26, goals: 10, assists: 9, motm: 5 },
    priceHistory: generateHistory(29.4, 5.8),
    markets: [
      {
        id: "leao-m1",
        question: "Token Leão >€30 entro fine settimana?",
        yesPct: 38,
        yesOdds: 2.63,
        noOdds: 1.61,
        bets: 2800,
        closingTime: makeClosingTime(48),
        isHot: false,
      },
    ],
  },
  {
    id: "dusan-vlahovic",
    name: "Dušan Vlahović",
    team: "Juventus",
    competition: "Serie A",
    position: "Attaccante",
    nationality: "SRB",
    photo: "/players/dusan-vlahovic.png",
    currentValue: 28.5,
    change24h: 4.7,
    change7d: 7.3,
    change30d: 9.1,
    volatility: "medium",
    holders: 7100,
    stats: { matches: 27, goals: 15, assists: 3, motm: 4 },
    priceHistory: generateHistory(28.5, 9.1),
    markets: [
      {
        id: "vlaho-m1",
        question: "Vlahović segnerà una doppietta vs Napoli?",
        yesPct: 29,
        yesOdds: 3.45,
        noOdds: 1.41,
        bets: 1900,
        closingTime: makeClosingTime(30),
        event: "Juventus vs Napoli",
        eventDate: "Dom 20:45",
      },
    ],
  },
  {
    id: "federico-chiesa",
    name: "Federico Chiesa",
    team: "Liverpool",
    competition: "Premier League",
    position: "Attaccante",
    nationality: "ITA",
    photo: "/players/federico-chiesa.png",
    currentValue: 22.1,
    change24h: 8.3,
    change7d: 12.5,
    change30d: 18.4,
    volatility: "high",
    holders: 6300,
    isHot: true,
    stats: { matches: 20, goals: 7, assists: 6, motm: 3 },
    priceHistory: generateHistory(22.1, 18.4),
    markets: [
      {
        id: "chiesa-m1",
        question: "Token Chiesa +10% questa settimana?",
        yesPct: 61,
        yesOdds: 1.64,
        noOdds: 2.56,
        bets: 2100,
        closingTime: makeClosingTime(72),
        isHot: true,
      },
    ],
  },
  {
    id: "theo-hernandez",
    name: "Théo Hernández",
    team: "Milan",
    competition: "Serie A",
    position: "Difesa",
    nationality: "FRA",
    photo: "/players/theo-hernandez.png",
    currentValue: 14.6,
    change24h: -0.8,
    change7d: 1.2,
    change30d: -3.4,
    volatility: "low",
    holders: 4800,
    stats: { matches: 24, goals: 3, assists: 7, motm: 2 },
    priceHistory: generateHistory(14.6, -3.4),
    markets: [
      {
        id: "theo-m1",
        question: "Theo assisterà o segnerà vs Inter?",
        yesPct: 44,
        yesOdds: 2.27,
        noOdds: 1.79,
        bets: 1400,
        closingTime: makeClosingTime(55),
        event: "Milan vs Inter",
        eventDate: "Sab 18:00",
      },
    ],
  },
  {
    id: "romelu-lukaku",
    name: "Romelu Lukaku",
    team: "Roma",
    competition: "Serie A",
    position: "Attaccante",
    nationality: "BEL",
    photo: "/players/romelu-lukaku.png",
    currentValue: 22.9,
    change24h: 3.1,
    change7d: 5.8,
    change30d: 11.3,
    volatility: "medium",
    holders: 6700,
    stats: { matches: 26, goals: 13, assists: 5, motm: 4 },
    priceHistory: generateHistory(22.9, 11.3),
    markets: [
      {
        id: "lukaku-m1",
        question: "Token Lukaku supererà €24 entro 7 giorni?",
        yesPct: 55,
        yesOdds: 1.82,
        noOdds: 2.22,
        bets: 2300,
        closingTime: makeClosingTime(168),
      },
    ],
  },
  {
    id: "jude-bellingham",
    name: "Jude Bellingham",
    team: "Real Madrid",
    competition: "La Liga",
    position: "Centrocampo",
    nationality: "ENG",
    photo: "/players/jude-bellingham.png",
    currentValue: 48.2,
    change24h: 1.9,
    change7d: 6.4,
    change30d: 16.7,
    volatility: "medium",
    holders: 15600,
    stats: { matches: 29, goals: 16, assists: 11, motm: 10 },
    priceHistory: generateHistory(48.2, 16.7),
    markets: [
      {
        id: "bellingham-m1",
        question: "Token Bellingham supererà €50 entro fine aprile?",
        yesPct: 72,
        yesOdds: 1.39,
        noOdds: 3.57,
        bets: 7800,
        closingTime: makeClosingTime(240),
      },
    ],
  },
  {
    id: "erling-haaland",
    name: "Erling Haaland",
    team: "Man City",
    competition: "Premier League",
    position: "Attaccante",
    nationality: "NOR",
    photo: "/players/erling-haaland.png",
    currentValue: 52.1,
    change24h: -3.2,
    change7d: -5.1,
    change30d: 2.3,
    volatility: "medium",
    holders: 18200,
    stats: { matches: 24, goals: 22, assists: 3, motm: 8 },
    priceHistory: generateHistory(52.1, 2.3),
    markets: [
      {
        id: "haaland-m1",
        question: "Haaland segnerà hat-trick questa settimana?",
        yesPct: 31,
        yesOdds: 3.23,
        noOdds: 1.45,
        bets: 5100,
        closingTime: makeClosingTime(96),
      },
    ],
  },
  {
    id: "marcus-thuram",
    name: "Marcus Thuram",
    team: "Inter",
    competition: "Serie A",
    position: "Attaccante",
    nationality: "FRA",
    photo: "/players/marcus-thuram.png",
    currentValue: 24.1,
    change24h: 5.6,
    change7d: 9.2,
    change30d: 17.8,
    volatility: "medium",
    holders: 5900,
    isHot: true,
    stats: { matches: 27, goals: 14, assists: 8, motm: 5 },
    priceHistory: generateHistory(24.1, 17.8),
    markets: [
      {
        id: "thuram-m1",
        question: "Thuram e Lautaro segneranno entrambi vs Napoli?",
        yesPct: 42,
        yesOdds: 2.38,
        noOdds: 1.72,
        bets: 2600,
        closingTime: makeClosingTime(16),
        event: "Inter vs Napoli",
        eventDate: "Dom 20:45",
        isHot: true,
      },
    ],
  },
  {
    id: "nicolo-barella",
    name: "Nicolò Barella",
    team: "Inter",
    competition: "Serie A",
    position: "Centrocampo",
    nationality: "ITA",
    photo: "/players/nicolo-barella.png",
    currentValue: 16.3,
    change24h: 0.4,
    change7d: 2.1,
    change30d: 6.5,
    volatility: "low",
    holders: 4200,
    stats: { matches: 27, goals: 4, assists: 11, motm: 3 },
    priceHistory: generateHistory(16.3, 6.5),
    markets: [
      {
        id: "barella-m1",
        question: "Barella finirà tra i top-3 MOTM di questa giornata?",
        yesPct: 48,
        yesOdds: 2.08,
        noOdds: 1.92,
        bets: 1100,
        closingTime: makeClosingTime(20),
        event: "Inter vs Napoli",
        eventDate: "Dom 20:45",
      },
    ],
  },
  {
    id: "pio-esposito",
    name: "Pio Esposito",
    team: "Inter",
    competition: "Serie A",
    position: "Attaccante",
    nationality: "ITA",
    photo: "/players/pio-esposito.png",
    currentValue: 8.5,
    change24h: 12.4,
    change7d: 24.3,
    change30d: 41.2,
    volatility: "high",
    holders: 3100,
    isHot: true,
    stats: { matches: 12, goals: 5, assists: 2, motm: 2 },
    priceHistory: generateHistory(8.5, 41.2),
    markets: [
      {
        id: "pio-m1",
        question: "Token Pio Esposito salirà >10% dopo Inter vs Napoli?",
        yesPct: 42,
        yesOdds: 2.38,
        noOdds: 1.72,
        bets: 1800,
        closingTime: makeClosingTime(13),
        event: "Inter vs Napoli",
        eventDate: "Dom 20:45",
        isHot: true,
      },
    ],
  },
  {
    id: "gianluigi-donnarumma",
    name: "Gianluigi Donnarumma",
    team: "PSG",
    competition: "Champions League",
    position: "Portiere",
    nationality: "ITA",
    photo: "/players/gianluigi-donnarumma.png",
    currentValue: 19.8,
    change24h: -1.1,
    change7d: 3.4,
    change30d: 8.9,
    volatility: "low",
    holders: 6100,
    stats: { matches: 28, goals: 0, assists: 0, motm: 6 },
    priceHistory: generateHistory(19.8, 8.9),
    markets: [
      {
        id: "donna-m1",
        question: "Donnarumma manterrà clean sheet vs Real Madrid?",
        yesPct: 37,
        yesOdds: 2.7,
        noOdds: 1.56,
        bets: 3400,
        closingTime: makeClosingTime(36),
        event: "PSG vs Real Madrid",
        eventDate: "Mar 21:00",
      },
    ],
  },
  {
    id: "pedri",
    name: "Pedri",
    team: "Barcellona",
    competition: "La Liga",
    position: "Centrocampo",
    nationality: "ESP",
    photo: "/players/pedri.png",
    currentValue: 31.7,
    change24h: 6.8,
    change7d: 11.4,
    change30d: 19.6,
    volatility: "medium",
    holders: 9800,
    isHot: true,
    stats: { matches: 25, goals: 5, assists: 14, motm: 7 },
    priceHistory: generateHistory(31.7, 19.6),
    markets: [
      {
        id: "pedri-m1",
        question: "Token Pedri +15% dopo El Clasico?",
        yesPct: 63,
        yesOdds: 1.59,
        noOdds: 2.7,
        bets: 4700,
        closingTime: makeClosingTime(40),
        event: "Barcellona vs Real Madrid",
        eventDate: "Sab 21:00",
        isHot: true,
      },
    ],
  },
];

export const HOT_MOVERS = MOCK_PLAYER_TOKENS.filter((p) => p.isHot);

export const LONG_TERM_MARKETS = [
  {
    id: "lt-capocannoniere",
    title: "Capocannoniere Serie A - Token Value",
    question: "Quale token supererà €50 entro fine stagione?",
    closingDate: "30 Maggio 2026",
    totalBets: 12400,
    options: [
      { player: MOCK_PLAYER_TOKENS[0], pct: 28 },
      { player: MOCK_PLAYER_TOKENS[1], pct: 24 },
      { player: MOCK_PLAYER_TOKENS[4], pct: 18 },
      { player: MOCK_PLAYER_TOKENS[10], pct: 12 },
      { player: MOCK_PLAYER_TOKENS[7], pct: 10 },
      { player: null, label: "Altro giocatore", pct: 8 },
    ],
  },
  {
    id: "lt-rookie-explosion",
    title: "Rookie Explosion 2026",
    question: "Quale rookie farà +100% nel valore token?",
    closingDate: "15 Giugno 2026",
    totalBets: 7200,
    options: [
      { player: MOCK_PLAYER_TOKENS[12], pct: 41 },
      { player: null, label: "Camarda (Milan)", pct: 27 },
      { player: null, label: "Casadei (Inter)", pct: 18 },
      { player: null, label: "Altro", pct: 14 },
    ],
  },
  {
    id: "lt-bellingham-50",
    title: "Bellingham €50 Milestone",
    question: "Token Bellingham supererà €50 entro giugno 2026?",
    closingDate: "30 Giugno 2026",
    totalBets: 9800,
    options: [
      { player: null, label: "SÌ, prima di giugno", pct: 72 },
      { player: null, label: "NO, non raggiungerà €50", pct: 28 },
    ],
  },
];

export const FEATURED_MARKET = {
  id: "featured-derby",
  badge: "EDITOR'S PICK",
  title: "Derby della Madonnina Special",
  question: "Il token del MOTM del derby salirà >15%?",
  description:
    "Il Derby più atteso della stagione. Storicamente, il MOTM vede spike del 10–20% nel valore token nelle 24h successive. Chi farà il salto questa volta?",
  event: "Milan vs Inter",
  eventDate: "Sabato 18:00",
  closingTime: makeClosingTime(54),
  totalPool: 45000,
  options: [
    { player: MOCK_PLAYER_TOKENS[0], pct: 28 },
    { player: MOCK_PLAYER_TOKENS[3], pct: 24 },
    { player: MOCK_PLAYER_TOKENS[6], pct: 18 },
    { player: null, label: "Altro giocatore", pct: 30 },
  ],
};
