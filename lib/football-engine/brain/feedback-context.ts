/**
 * Fetches recent admin feedback from the database and formats it as a prompt
 * block for BRAIN agents (Creative, Verifier).
 *
 * Only negative feedback is surfaced to avoid prompt bloat — positive feedback
 * means "keep doing this" and doesn't need explicit instruction.
 */

import { prisma } from "@/lib/prisma";

const FEEDBACK_WINDOW_DAYS = 30;
const MAX_ENTRIES_PER_CATEGORY = 5;

interface RawFeedback {
  rating: string;
  reason: string | null;
  category: string;
  createdAt: Date;
}

const CATEGORY_LABELS: Record<string, string> = {
  OVERALL: "COMPLESSIVO",
  TITLE: "TITOLO",
  DESCRIPTION: "DESCRIZIONE",
  MARKET_TYPE: "TIPO MERCATO",
  RESOLUTION_CRITERIA: "CRITERI RISOLUZIONE",
  CREATIVITY: "CREATIVITÀ",
};

export async function fetchRecentNegativeFeedback(): Promise<RawFeedback[]> {
  const since = new Date();
  since.setDate(since.getDate() - FEEDBACK_WINDOW_DAYS);

  return prisma.eventFeedback.findMany({
    where: {
      rating: "NEGATIVE",
      createdAt: { gte: since },
      reason: { not: null },
    },
    select: {
      rating: true,
      reason: true,
      category: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/**
 * Builds a markdown-formatted prompt block from recent negative feedback.
 * Returns empty string when there is no relevant feedback — callers can
 * safely concatenate without polluting prompts.
 */
export async function buildFeedbackPromptBlock(): Promise<string> {
  let feedbacks: RawFeedback[];
  try {
    feedbacks = await fetchRecentNegativeFeedback();
  } catch {
    return "";
  }

  if (feedbacks.length === 0) return "";

  const byCategory = new Map<string, string[]>();
  for (const fb of feedbacks) {
    if (!fb.reason) continue;
    const cat = fb.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    const list = byCategory.get(cat)!;
    if (list.length < MAX_ENTRIES_PER_CATEGORY) {
      list.push(fb.reason);
    }
  }

  if (byCategory.size === 0) return "";

  const lines: string[] = [
    "",
    "## FEEDBACK DALL'ADMIN (lezioni apprese)",
    `Negli ultimi ${FEEDBACK_WINDOW_DAYS} giorni l'admin ha segnalato questi problemi ricorrenti:`,
    "",
  ];

  for (const [cat, reasons] of byCategory) {
    const label = CATEGORY_LABELS[cat] ?? cat;
    lines.push(`### ${label} (${reasons.length} segnalazion${reasons.length === 1 ? "e" : "i"})`);
    for (const r of reasons) {
      lines.push(`- "${r}"`);
    }
    lines.push("");
  }

  lines.push("IMPORTANTE: evita di ripetere questi errori nei nuovi eventi.");
  lines.push("");

  return lines.join("\n");
}
