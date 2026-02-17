import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runPipeline } from "@/lib/event-generation";

export const dynamic = "force-dynamic";

/**
 * Collect missing env var names for the pipeline.
 * - NEWS_API_KEY: ingestion/trend
 * - DATABASE_URL: prisma
 * - OPENAI_API_KEY or ANTHROPIC_API_KEY: generation (based on GENERATION_PROVIDER)
 */
function getMissingEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.NEWS_API_KEY?.trim()) missing.push("NEWS_API_KEY");
  if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
  const provider = (process.env.GENERATION_PROVIDER ?? "openai") as "openai" | "anthropic";
  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY?.trim()) missing.push("OPENAI_API_KEY");
  } else {
    if (!process.env.ANTHROPIC_API_KEY?.trim()) missing.push("ANTHROPIC_API_KEY");
  }
  return missing;
}

/** Verify Authorization: Bearer with CRON_SECRET. Returns 401 if missing/invalid. */
function isAuthorized(
  request: NextRequest
): { ok: true } | { ok: false; status: number; body: object } {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    return {
      ok: false,
      status: 503,
      body: { error: "CRON_SECRET non configurato", ok: false },
    };
  }
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || token !== cronSecret) {
    return { ok: false, status: 401, body: { error: "Unauthorized", ok: false } };
  }
  return { ok: true };
}

/** Default number of markets to publish per run. */
const DEFAULT_PUBLISH_COUNT = 5;

export type GenerateMarketsResponse = {
  ok: boolean;
  candidates: number;
  approved: number;
  rejected: number;
  published: number;
  errors: string[];
  missingEnv?: string[];
};

/** Runs the pipeline with the given publishCount; returns response body and status. */
async function runGenerateMarkets(
  publishCount: number
): Promise<{ body: GenerateMarketsResponse; status: number }> {
  const missingEnv = getMissingEnvVars();
  if (missingEnv.length > 0) {
    console.warn("[cron/generate-markets] Missing required env vars:", missingEnv.join(", "));
    return {
      body: {
        ok: false,
        candidates: 0,
        approved: 0,
        rejected: 0,
        published: 0,
        errors: [],
        missingEnv: [...missingEnv],
      },
      status: 503,
    };
  }

  const result = await runPipeline(prisma, {
    limit: Math.max(publishCount * 4, 40),
    generation: {
      maxPerCategory: Math.max(2, Math.ceil(publishCount / 2)),
      maxTotal: publishCount,
      maxRetries: 2,
    },
  });

  const { candidatesCount, generatedCount, createResult } = result;
  const published = createResult.created;
  const approved = generatedCount;
  const rejected = candidatesCount - published;
  const errors = createResult.errors.map(
    (e) => `[${e.index}] ${e.title}: ${e.reason}`
  );

  console.log("[cron/generate-markets] summary", {
    candidates: candidatesCount,
    approved,
    rejected,
    published,
    errors: errors.length,
  });

  return {
    body: {
      ok: true,
      candidates: candidatesCount,
      approved,
      rejected,
      published,
      errors,
    },
    status: 200,
  };
}

/**
 * GET /api/cron/generate-markets
 *
 * Same as POST with default publishCount. Used by Vercel Cron (sends GET).
 * Protected by CRON_SECRET: Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: NextRequest) {
  const auth = isAuthorized(request);
  if (!auth.ok) {
    return NextResponse.json(auth.body, { status: auth.status });
  }
  try {
    const { body, status } = await runGenerateMarkets(DEFAULT_PUBLISH_COUNT);
    return NextResponse.json(body, { status });
  } catch (error) {
    console.error("[cron/generate-markets] error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        candidates: 0,
        approved: 0,
        rejected: 0,
        published: 0,
        errors: [message],
      } satisfies GenerateMarketsResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/generate-markets
 *
 * Runs the market generation pipeline end-to-end:
 * ingestion/trend → draft (LLM) → validator → publish.
 *
 * - Protected by CRON_SECRET: Authorization: Bearer <CRON_SECRET>. No NextAuth/session.
 * - Body (optional): { publishCount?: number } — how many markets to publish (default 5).
 * - If required env vars are missing, logs them and returns 503 with missingEnv (names only).
 *
 * Response: { ok, candidates, approved, rejected, published, errors, missingEnv? }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json(auth.body, { status: auth.status });
    }

    let publishCount = DEFAULT_PUBLISH_COUNT;
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await request.json();
        if (typeof body?.publishCount === "number" && body.publishCount >= 0) {
          publishCount = Math.min(100, Math.max(0, Math.floor(body.publishCount)));
        }
      }
    } catch {
      // ignore invalid JSON; use default publishCount
    }

    const { body, status } = await runGenerateMarkets(publishCount);
    return NextResponse.json(body, { status });
  } catch (error) {
    console.error("[cron/generate-markets] error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        candidates: 0,
        approved: 0,
        rejected: 0,
        published: 0,
        errors: [message],
      } satisfies GenerateMarketsResponse,
      { status: 500 }
    );
  }
}
