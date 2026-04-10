import { createHash } from "node:crypto";

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hashKey(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function canonicalReplicaKey(params: {
  title: string;
  sourcePlatform: string;
  closeTimeIso: string;
}): string {
  return hashKey(
    `${normalizeText(params.title)}|${params.sourcePlatform}|${params.closeTimeIso.slice(0, 10)}`
  );
}

export function dedupByCanonicalTitle<T extends { title: string; closeTime: Date }>(
  items: T[]
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = `${normalizeText(item.title)}|${item.closeTime.toISOString().slice(0, 10)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
