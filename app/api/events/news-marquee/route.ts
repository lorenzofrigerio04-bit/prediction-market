import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEventsWithStats } from "@/lib/fomo/event-stats";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { HOME_FEED_SOURCE_TYPE } from "@/lib/event-visibility";

export const dynamic = "force-dynamic";

const POOL = 160;

type GenScores = {
  trend_score?: number;
  image_score?: number;
  overall_score?: number;
};

function parseGenerationScores(raw: unknown): GenScores | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const num = (k: string) => (typeof o[k] === "number" ? (o[k] as number) : undefined);
  return {
    trend_score: num("trend_score"),
    image_score: num("image_score"),
    overall_score: num("overall_score"),
  };
}

/** Soglia image_score: proxy “copertina più viva / colori accesi” (AI). */
const VIVID_COVER_MIN_SCORE = 0.52;
const VIVID_COVER_BONUS_MIN = 0.56;

function marqueeTiers(
  row: {
    totalCredits: number | null;
    imageUrl: string | null;
    imageGenerationStatus: string;
    generationScores: unknown;
  },
  predCount: number,
  velocity: number
): {
  superTrend: boolean;
  strongTrend: boolean;
  vividCover: boolean;
  gs: GenScores | null;
  hasCover: boolean;
  aiCoverOk: boolean;
} {
  const gs = parseGenerationScores(row.generationScores);
  const credits = row.totalCredits ?? 0;
  const hasCover = !!(row.imageUrl?.trim());
  const aiCoverOk = hasCover && row.imageGenerationStatus === "SUCCESS";

  const superTrend =
    velocity >= 4 ||
    credits >= 1200 ||
    predCount >= 80 ||
    (velocity >= 2 && predCount >= 36);

  const strongTrend =
    superTrend ||
    velocity >= 1.2 ||
    credits >= 320 ||
    predCount >= 26 ||
    (gs?.trend_score != null && gs.trend_score >= 0.72);

  const vividCover =
    aiCoverOk &&
    (gs?.image_score != null ? gs.image_score >= VIVID_COVER_MIN_SCORE : false);

  return { superTrend, strongTrend, vividCover, gs, hasCover, aiCoverOk };
}

/**
 * Priorità per il rail /news: prima riempiamo con super-trend ∪ copertine vivid;
 * se non bastano, il resto ordina per score composito (sempre i più interessanti).
 */
function newsMarqueeInterestScore(
  row: {
    totalCredits: number | null;
    imageUrl: string | null;
    imageGenerationStatus: string;
    generationScores: unknown;
  },
  predCount: number,
  velocity: number
): number {
  const { superTrend, strongTrend, vividCover, gs, hasCover, aiCoverOk } =
    marqueeTiers(row, predCount, velocity);
  const credits = row.totalCredits ?? 0;
  const log1p = (x: number) => Math.log1p(Math.max(0, x));

  const vividStrength = aiCoverOk
    ? 0.52 + 0.48 * Math.min(1, Math.max(0, gs?.image_score ?? 0.4))
    : hasCover
      ? 0.2
      : 0;

  let score =
    2.6 * log1p(velocity) +
    2.0 * log1p(credits) +
    1.35 * log1p(predCount) +
    1.85 * (gs?.trend_score ?? 0) +
    1.12 * (gs?.overall_score ?? 0) +
    2.35 * vividStrength;

  if (strongTrend) score += 18;
  if (superTrend) score += 22;
  if (vividCover && gs?.image_score != null && gs.image_score >= VIVID_COVER_BONUS_MIN) score += 9;
  if (!hasCover) score -= 5;

  return score;
}

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(Math.max(parseInt(request.nextUrl.searchParams.get("limit") || "32", 10) || 32, 4), 50);
    const now = new Date();

    const where = {
      ...HOME_FEED_SOURCE_TYPE,
      resolved: false,
      closesAt: { gt: now },
    };

    const events = await prisma.event.findMany({
      where,
      orderBy: [{ totalCredits: "desc" }, { createdAt: "desc" }],
      take: POOL,
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
        _count: { select: { Prediction: true, Trade: true, comments: true } },
        ammState: {
          select: { qYesMicros: true, qNoMicros: true, bMicros: true },
        },
      },
    });

    const predictionsCount = (c: { Prediction: number; Trade: number }) =>
      (c.Prediction ?? 0) + (c.Trade ?? 0);

    const eventIds = events.map((e) => e.id);
    const fomoStats = await getEventsWithStats(prisma, eventIds, now);

    type Row = (typeof events)[number];
    const scored = events.map((event: Row) => {
      const stats = fomoStats.get(event.id);
      const _count = event._count as { Prediction: number; Trade: number; comments: number };
      const predCount = predictionsCount(_count);
      const velocity = stats?.votesVelocity ?? 0;
      const rowMeta = {
        totalCredits: event.totalCredits,
        imageUrl: event.imageUrl,
        imageGenerationStatus: event.imageGenerationStatus,
        generationScores: event.generationScores,
      };
      const { superTrend, vividCover } = marqueeTiers(rowMeta, predCount, velocity);
      const preferred = superTrend || vividCover;
      const interest = newsMarqueeInterestScore(rowMeta, predCount, velocity);
      return { event, predCount, interest, preferred, stats, _count };
    });

    const byInterest = (a: (typeof scored)[number], b: (typeof scored)[number]) => {
      if (b.interest !== a.interest) return b.interest - a.interest;
      return a.event.id.localeCompare(b.event.id);
    };

    const primary = scored.filter((s) => s.preferred).sort(byInterest);
    const secondary = scored.filter((s) => !s.preferred).sort(byInterest);
    const picked = [...primary.slice(0, limit), ...secondary.slice(0, Math.max(0, limit - primary.length))];

    const mapped = picked.map(({ event, predCount, stats, _count }) => {
      const { ammState, ...rest } = event;
      let probability = 50;
      if (ammState) {
        const yesMicros = priceYesMicros(ammState.qYesMicros, ammState.qNoMicros, ammState.bMicros);
        probability = Number((yesMicros * 100n) / SCALE);
      }
      return {
        ...rest,
        probability,
        _count: { predictions: predCount, comments: _count.comments },
        fomo: stats || {
          countdownMs: new Date(event.closesAt).getTime() - now.getTime(),
          participantsCount: predCount,
          votesVelocity: 0,
          pointsMultiplier: 1.0,
          isClosingSoon: false,
        },
      };
    });

    return NextResponse.json({ ok: true, events: mapped });
  } catch (error) {
    console.error("[news-marquee]", error);
    return NextResponse.json({ ok: false, error: "Errore nel caricamento" }, { status: 500 });
  }
}
