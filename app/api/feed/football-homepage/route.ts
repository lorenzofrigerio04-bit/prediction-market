import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, pricesByOutcomeMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { getEventMarketSharesByOutcome } from "@/lib/amm/multi-outcome-engine";
import { parseOutcomesJson, MULTI_OPTION_MARKET_TYPES, isMarketTypeId } from "@/lib/market-types";
import { ACTIVE_SPORT_20_WHERE, LIVE_MATCH_STATUSES, isUniqueMarket } from "@/lib/filterSport20Pipeline";
import type { FootballEvent, FootballHomepagePayload, CalendarDay } from "@/types/homepage";

export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MICROS_PER_CREDIT = 1_000_000n;

type EventMeta = { sport_league?: string; fie_version?: string } | null;
type OutcomeProbability = { key: string; label: string; probabilityPct: number };

function formatCalendarDateLabel(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).replace(/^\w/, (c) => c.toUpperCase());
}

/** Returns the kickoff date for an event (realWorldEventTime, or closesAt - 90 min). */
function getKickoffDate(event: {
  realWorldEventTime: Date | null;
  closesAt: Date;
}): Date {
  if (event.realWorldEventTime) return event.realWorldEventTime;
  const d = new Date(event.closesAt);
  d.setMinutes(d.getMinutes() - 90);
  return d;
}

/**
 * GET /api/feed/football-homepage
 *
 * Returns structured sections for the football-focused homepage.
 * All events come from the Sport 2.0 pipeline (sourceType = "SPORT").
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    const now = new Date();

    // ── Fetch all active sport 2.0 events ──────────────────────────────────
    const eventsRaw = await prisma.event.findMany({
      where: {
        ...ACTIVE_SPORT_20_WHERE,
        closesAt: { gt: now },
      },
      orderBy: [{ closesAt: "asc" }, { createdAt: "desc" }],
      take: 200,
      include: {
        _count: {
          select: { Prediction: true, Trade: true, feedbacks: true },
        },
        ammState: {
          select: { qYesMicros: true, qNoMicros: true, bMicros: true },
        },
      },
    });

    if (eventsRaw.length === 0) {
      const empty: FootballHomepagePayload = {
        liveEvents: [],
        topEvents: [],
        popularMarkets: [],
        forYouMarkets: [],
        uniqueMarkets: [],
        calendar: [],
        top24hEvents: [],
        viralEvents: [],
        expiringEvents: [],
        isEmpty: true,
        isPersonalized: false,
      };
      return NextResponse.json(empty);
    }

    // ── Aggregate trade volume ──────────────────────────────────────────────
    const eventIds = eventsRaw.map((e) => e.id);
    const buyTrades = await prisma.trade.groupBy({
      by: ["eventId"],
      where: { eventId: { in: eventIds }, side: "BUY" },
      _sum: { costMicros: true },
    });
    const tradeCreditsMap = new Map<string, number>();
    for (const row of buyTrades) {
      const raw = row._sum.costMicros ?? 0n;
      const credits = Number((raw < 0n ? -raw : raw) / MICROS_PER_CREDIT);
      if (Number.isFinite(credits)) tradeCreditsMap.set(row.eventId, credits);
    }

    // ── User personalization signals ────────────────────────────────────────
    let userCategories: string[] = [];
    if (userId) {
      const userPreds = await prisma.prediction.findMany({
        where: { userId, eventId: { in: eventIds } },
        select: { event: { select: { category: true } } },
        take: 50,
      });
      userCategories = [
        ...new Set(userPreds.map((p) => p.event?.category).filter(Boolean) as string[]),
      ];
    }
    const isPersonalized = userCategories.length > 0;

    // ── Process each event ──────────────────────────────────────────────────
    type ProcessedEvent = FootballEvent & {
      kickoffDate: Date;
      sortScore: number;
    };

    const processed: ProcessedEvent[] = await Promise.all(
      eventsRaw.map(async (event): Promise<ProcessedEvent> => {
        const { _count, ammState } = event;
        const predCount = (_count.Prediction ?? 0) + (_count.Trade ?? 0);
        const meta = (event.creationMetadata as EventMeta) ?? null;

        const marketType = event.marketType ?? "BINARY";
        const isMultiOutcomeMarket =
          isMarketTypeId(marketType) && MULTI_OPTION_MARKET_TYPES.includes(marketType);
        const outcomeOptions = parseOutcomesJson(event.outcomes) ?? [];

        let probability = 50;
        let outcomeProbabilities: OutcomeProbability[] | null = null;

        // Multi-outcome markets always get outcomeProbabilities, regardless of ammState.
        // ammState is a binary AMM and doesn't reflect multi-outcome odds.
        if (isMultiOutcomeMarket && outcomeOptions.length > 0) {
          try {
            const keys = outcomeOptions.map((o) => o.key);
            const qByOutcome = await getEventMarketSharesByOutcome(prisma, event.id, keys);
            const bMicros = BigInt(Math.max(1, Math.round((event.b ?? 1) * 1_000_000)));
            const prices = pricesByOutcomeMicros(keys, qByOutcome, bMicros);
            outcomeProbabilities = outcomeOptions.map((opt) => ({
              key: opt.key,
              label: opt.label,
              probabilityPct: Number((prices[opt.key] * 100n) / SCALE),
            }));
            // derive a representative probability (top outcome) for sortScore
            probability = Math.max(...outcomeProbabilities.map((o) => o.probabilityPct));
          } catch {
            outcomeProbabilities = outcomeOptions.map((opt) => ({
              key: opt.key,
              label: opt.label,
              probabilityPct: Math.round(100 / Math.max(1, outcomeOptions.length)),
            }));
            probability = Math.round(100 / Math.max(1, outcomeOptions.length));
          }
        } else if (ammState) {
          const yesMicros = priceYesMicros(
            ammState.qYesMicros,
            ammState.qNoMicros,
            ammState.bMicros
          );
          probability = Number((yesMicros * 100n) / SCALE);
        }

        const totalCredits =
          tradeCreditsMap.get(event.id) ?? event.totalCredits ?? 0;
        const sortScore = predCount * 1.5 + Math.log1p(totalCredits);
        const kickoffDate = getKickoffDate({
          realWorldEventTime: event.realWorldEventTime ?? null,
          closesAt: event.closesAt,
        });

        return {
          id: event.id,
          title: event.title,
          category: event.category,
          closesAt: event.closesAt.toISOString(),
          createdAt: event.createdAt.toISOString(),
          yesPct: Math.round(probability),
          predictionsCount: predCount,
          totalCredits,
          aiImageUrl: event.imageUrl ?? null,
          marketType: event.marketType ?? null,
          outcomes: parseOutcomesJson(event.outcomes) ?? null,
          outcomeProbabilities: outcomeProbabilities ?? null,
          isFie: meta?.fie_version != null,
          matchStatus: event.matchStatus ?? null,
          realWorldEventTime: event.realWorldEventTime?.toISOString() ?? null,
          sportLeague: meta?.sport_league ?? null,
          kickoffDate,
          sortScore,
        };
      })
    );

    // ── Section 1: Live events ──────────────────────────────────────────────
    const liveEvents = processed
      .filter((e) => LIVE_MATCH_STATUSES.has(e.matchStatus ?? ""))
      .slice(0, 6);

    const nonLive = processed.filter((e) => !LIVE_MATCH_STATUSES.has(e.matchStatus ?? ""));

    // ── Section 2: Top events of the week ───────────────────────────────────
    const sevenDaysLater = new Date(now.getTime() + SEVEN_DAYS_MS);
    const topEvents = nonLive
      .filter((e) => e.kickoffDate.getTime() <= sevenDaysLater.getTime())
      .sort((a, b) => b.sortScore - a.sortScore)
      .slice(0, 8);

    // ── Section 3: Popular markets (highest engagement) ─────────────────────
    const popularMarkets = [...processed]
      .sort((a, b) => b.predictionsCount - a.predictionsCount)
      .slice(0, 5);

    // ── Section 4: For You (personalized or trending) ───────────────────────
    let forYouMarkets: ProcessedEvent[];
    if (isPersonalized) {
      const preferred = nonLive.filter((e) => userCategories.includes(e.category));
      const rest = nonLive.filter((e) => !userCategories.includes(e.category));
      forYouMarkets = [...preferred, ...rest.sort((a, b) => b.sortScore - a.sortScore)]
        .slice(0, 6);
    } else {
      forYouMarkets = [...nonLive]
        .sort((a, b) => b.sortScore - a.sortScore)
        .slice(0, 6);
    }

    // ── Section 5: Unique markets ────────────────────────────────────────────
    const uniqueMarkets = nonLive
      .filter((e) => isUniqueMarket(e.title))
      .sort((a, b) => b.sortScore - a.sortScore)
      .slice(0, 5);

    // ── Section 6: Upcoming calendar (next 7 days) ──────────────────────────
    const upcomingForCalendar = nonLive
      .filter((e) => {
        const t = e.kickoffDate.getTime();
        return t >= now.getTime() && t <= sevenDaysLater.getTime();
      })
      .sort((a, b) => a.kickoffDate.getTime() - b.kickoffDate.getTime())
      .slice(0, 20);

    const dayMap = new Map<string, { dateLabel: string; events: FootballEvent[] }>();
    for (const event of upcomingForCalendar) {
      const dayKey = event.kickoffDate.toISOString().slice(0, 10);
      const dayLabel = formatCalendarDateLabel(event.kickoffDate);
      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, { dateLabel: dayLabel, events: [] });
      }
      const { kickoffDate: _kd, sortScore: _ss, ...footEvent } = event;
      dayMap.get(dayKey)!.events.push(footEvent);
    }
    const calendar: CalendarDay[] = [...dayMap.entries()].map(([dateKey, val]) => ({
      dateKey,
      dateLabel: val.dateLabel,
      events: val.events,
    }));

    // ── New section: Top 5 eventi ultime 24h ────────────────────────────────
    const h24ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const top24hEvents = [...processed]
      .sort((a, b) => b.sortScore - a.sortScore)
      .slice(0, 5);
    void h24ago; // kept for reference; using all events ranked by score as "top"

    // ── New section: Viral events (highest engagement velocity) ─────────────
    const viralEvents = [...processed]
      .map((e) => {
        const createdMs = new Date(e.createdAt).getTime();
        const ageHours = Math.max(1, (now.getTime() - createdMs) / (1000 * 60 * 60));
        const velocity = e.predictionsCount / ageHours;
        return { ...e, velocity };
      })
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 6);

    // ── New section: Expiring events (closing in next 48h) ───────────────────
    const h48ahead = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const expiringEvents = [...processed]
      .filter((e) => {
        const t = new Date(e.closesAt).getTime();
        return t > now.getTime() && t <= h48ahead.getTime();
      })
      .sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime())
      .slice(0, 6);

    // ── Strip internal fields and return ────────────────────────────────────
    const strip = ({ kickoffDate: _kd, sortScore: _ss, ...e }: ProcessedEvent): FootballEvent => e;
    // viralEvents have an extra `velocity` field — strip it as well
    const stripViral = ({ kickoffDate: _kd, sortScore: _ss, velocity: _v, ...e }: ProcessedEvent & { velocity: number }): FootballEvent => e;

    const payload: FootballHomepagePayload = {
      liveEvents: liveEvents.map(strip),
      topEvents: topEvents.map(strip),
      popularMarkets: popularMarkets.map(strip),
      forYouMarkets: forYouMarkets.map(strip),
      uniqueMarkets: uniqueMarkets.map(strip),
      calendar,
      top24hEvents: top24hEvents.map(strip),
      viralEvents: viralEvents.map(stripViral),
      expiringEvents: expiringEvents.map(strip),
      isEmpty: false,
      isPersonalized,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[football-homepage] Error:", error);
    return NextResponse.json({ error: "Errore nel caricamento" }, { status: 500 });
  }
}
