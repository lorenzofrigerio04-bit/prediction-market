/**
 * Fetches all recent admin feedback from the database and formats it as a
 * structured prompt block for BRAIN agents (Creative, Verifier).
 *
 * Includes BOTH positive and negative feedback:
 * - Positive: reinforces patterns that worked well ("fai di più così")
 * - Negative: signals patterns to avoid ("non ripetere questi errori")
 *
 * Entries without an explicit reason text are still included as
 * category-level signals (the admin expressed a preference for that category).
 */

import { prisma } from "@/lib/prisma";

const FEEDBACK_WINDOW_DAYS = 90;
const MAX_ENTRIES_PER_CATEGORY = 8;

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

export async function fetchAllRecentFeedback(): Promise<RawFeedback[]> {
  const since = new Date();
  since.setDate(since.getDate() - FEEDBACK_WINDOW_DAYS);

  return prisma.eventFeedback.findMany({
    where: {
      createdAt: { gte: since },
    },
    select: {
      rating: true,
      reason: true,
      category: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

/**
 * Builds a markdown-formatted prompt block from all recent admin feedback.
 *
 * Positive entries → section "COSA HA FUNZIONATO BENE" (reinforce)
 * Negative entries → section "COSA EVITARE" (correct)
 *
 * Returns empty string when there is no feedback — safe to concatenate.
 */
export async function buildFeedbackPromptBlock(): Promise<string> {
  let feedbacks: RawFeedback[];
  try {
    feedbacks = await fetchAllRecentFeedback();
  } catch {
    return "";
  }

  if (feedbacks.length === 0) return "";

  // Separate by rating
  const positive = feedbacks.filter((f) => f.rating === "POSITIVE");
  const negative = feedbacks.filter((f) => f.rating === "NEGATIVE");

  if (positive.length === 0 && negative.length === 0) return "";

  const lines: string[] = [
    "",
    "## FEEDBACK DALL'ADMIN (lezioni apprese)",
    `Negli ultimi ${FEEDBACK_WINDOW_DAYS} giorni l'admin ha fornito ${feedbacks.length} valutazioni sugli eventi generati.`,
    "Tieni conto di questo feedback per generare eventi migliori:",
    "",
  ];

  // ── Positive feedback ──────────────────────────────────────
  if (positive.length > 0) {
    const posWithReason = positive.filter((f) => f.reason?.trim());
    const posByCategory = groupByCategory(posWithReason, MAX_ENTRIES_PER_CATEGORY);
    const posCategoryCounts = countByCategory(positive);

    lines.push("### ✅ COSA HA FUNZIONATO BENE (continua così)");

    // Show category counts even when no reason available
    for (const [cat, count] of Object.entries(posCategoryCounts)) {
      const label = CATEGORY_LABELS[cat] ?? cat;
      const reasons = posByCategory.get(cat) ?? [];
      lines.push(`**${label}** — ${count} valutazion${count === 1 ? "e" : "i"} positive`);
      if (reasons.length > 0) {
        for (const r of reasons) {
          lines.push(`  + "${r}"`);
        }
      }
    }
    lines.push("");
  }

  // ── Negative feedback ──────────────────────────────────────
  if (negative.length > 0) {
    const negWithReason = negative.filter((f) => f.reason?.trim());
    const negByCategory = groupByCategory(negWithReason, MAX_ENTRIES_PER_CATEGORY);
    const negCategoryCounts = countByCategory(negative);

    lines.push("### ❌ COSA EVITARE (errori ricorrenti)");

    for (const [cat, count] of Object.entries(negCategoryCounts)) {
      const label = CATEGORY_LABELS[cat] ?? cat;
      const reasons = negByCategory.get(cat) ?? [];
      lines.push(`**${label}** — ${count} segnalazion${count === 1 ? "e" : "i"} negative`);
      if (reasons.length > 0) {
        for (const r of reasons) {
          lines.push(`  - "${r}"`);
        }
      } else {
        lines.push(`  - (l'admin ha segnalato problemi in questa categoria senza specificarne la causa)`);
      }
    }
    lines.push("");
  }

  lines.push("OBIETTIVO: massimizza i pattern positivi ed evita sistematicamente gli errori segnalati.");
  lines.push("");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByCategory(
  feedbacks: RawFeedback[],
  maxPerCategory: number
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const fb of feedbacks) {
    if (!fb.reason?.trim()) continue;
    const cat = fb.category;
    if (!map.has(cat)) map.set(cat, []);
    const list = map.get(cat)!;
    if (list.length < maxPerCategory) {
      list.push(fb.reason.trim());
    }
  }
  return map;
}

function countByCategory(feedbacks: RawFeedback[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const fb of feedbacks) {
    counts[fb.category] = (counts[fb.category] ?? 0) + 1;
  }
  return counts;
}
