import type { NewsFormat } from "@/lib/news-engine/types";

/** RGB per la linea sfumata sotto «Segui» (centro più saturo, estremità trasparenti). */
export const NEWS_PROFILE_ACTION_LINE_RGB: Record<NewsFormat, readonly [number, number, number]> = {
  BREAKING: [244, 63, 94],
  GOSSIP: [167, 139, 250],
  ANALYTICS: [80, 245, 252],
  REPORT: [252, 211, 77],
  HOT_TAKE: [52, 211, 153],
};

/** Formato compatto stile social (es. 28,4k · 1,2M). */
export function formatSocialCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  const rounded = Math.round(n);
  if (rounded >= 1_000_000) {
    const v = rounded / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(".", ",")}M`;
  }
  if (rounded >= 100_000) {
    return `${Math.round(rounded / 1000)}k`;
  }
  if (rounded >= 10_000) {
    return `${(rounded / 1000).toFixed(1).replace(".", ",")}k`;
  }
  if (rounded >= 1000) {
    return `${(rounded / 1000).toFixed(1).replace(".", ",")}k`;
  }
  return rounded.toLocaleString("it-IT");
}
