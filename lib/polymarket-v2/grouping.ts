import type { SourceMarket } from "@/lib/event-replica/types";
import { hashKey, normalizeText } from "@/lib/event-replica/utils";

interface ParsedWinQuestion {
  entity: string;
  verb: string;
  contest: string;
}

function isYesNoBinary(market: SourceMarket): boolean {
  if (!Array.isArray(market.outcomes) || market.outcomes.length !== 2) return false;
  const labels = market.outcomes.map((o) => o.label.trim().toLowerCase());
  const yesNo = new Set(["yes", "no", "si", "sì"]);
  return labels.every((label) => yesNo.has(label));
}

function parseWillWinQuestion(title: string): ParsedWinQuestion | null {
  const normalized = title.trim().replace(/\?+$/, "");
  const match = normalized.match(
    /^will\s+(.+?)\s+(win|be|become|get|receive|secure|take)\s+(.+)$/i
  );
  if (!match) return null;
  const entity = match[1]?.trim();
  const verb = match[2]?.trim().toLowerCase();
  const contest = match[3]?.trim();
  if (!entity || !contest) return null;
  if (entity.length < 2 || contest.length < 6) return null;
  return { entity, verb, contest };
}

function buildGroupedQuestion(verb: string, contest: string): string {
  const lowerContest = contest.toLowerCase();
  const teamLike =
    /\b(world cup|fifa|cup|league|championship|tournament|team|club|nation)\b/i.test(
      lowerContest
    );

  const subject = teamLike ? "Which team" : "Who";
  return `${subject} will ${verb} ${contest}?`;
}

function toOutcomeKey(label: string, index: number): string {
  const slug = label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40);
  return slug || `opt_${index}`;
}

export function groupBinarySiblingsIntoMultiOutcome(params: {
  markets: SourceMarket[];
  minSiblings: number;
  maxOutcomes: number;
}): {
  groupedMarkets: SourceMarket[];
  groupedClusterCount: number;
  groupedSourceMarketsCount: number;
} {
  const { markets, minSiblings, maxOutcomes } = params;
  const byCluster = new Map<
    string,
    Array<{ market: SourceMarket; parsed: ParsedWinQuestion }>
  >();

  for (const market of markets) {
    if (!isYesNoBinary(market)) continue;
    const parsed = parseWillWinQuestion(market.title);
    if (!parsed) continue;
    const day = market.closeTime.toISOString().slice(0, 10);
    const clusterKey = `${normalizeText(parsed.contest)}|${day}`;
    if (!byCluster.has(clusterKey)) byCluster.set(clusterKey, []);
    byCluster.get(clusterKey)?.push({ market, parsed });
  }

  const consumedExternalIds = new Set<string>();
  const syntheticMarkets: SourceMarket[] = [];
  let groupedClusterCount = 0;
  let groupedSourceMarketsCount = 0;

  for (const [clusterKey, rows] of byCluster.entries()) {
    const uniqueEntityMap = new Map<string, { market: SourceMarket; parsed: ParsedWinQuestion }>();
    for (const row of rows) {
      const entityKey = normalizeText(row.parsed.entity);
      if (!uniqueEntityMap.has(entityKey)) {
        uniqueEntityMap.set(entityKey, row);
      }
    }
    const deduped = Array.from(uniqueEntityMap.values());
    if (deduped.length < minSiblings) continue;

    const selected = deduped
      .sort((a, b) => (b.market.provenance.rankValue ?? 0) - (a.market.provenance.rankValue ?? 0))
      .slice(0, maxOutcomes);

    const base = selected[0].market;
    const contest = selected[0].parsed.contest;
    const verb = selected[0].parsed.verb;
    const sourceChildren = selected.map((row, idx) => ({
      externalId: row.market.externalId,
      sourceUrl: row.market.sourceUrl,
      outcomeLabel: row.parsed.entity,
      outcomeKey: toOutcomeKey(row.parsed.entity, idx),
      rankValue: row.market.provenance.rankValue ?? 0,
    }));

    for (const child of sourceChildren) consumedExternalIds.add(child.externalId);

    const syntheticExternalId = `poly_group_${hashKey(clusterKey).slice(0, 20)}`;
    const outcomes = sourceChildren.map((child) => ({
      key: child.outcomeKey,
      label: child.outcomeLabel,
    }));

    syntheticMarkets.push({
      externalId: syntheticExternalId,
      sourcePlatform: "polymarket",
      sourceUrl: base.sourceUrl,
      title: buildGroupedQuestion(verb, contest),
      description:
        `Grouped from ${sourceChildren.length} Polymarket binary sibling markets ` +
        `about the same winner question.`,
      category: base.category,
      closeTime: base.closeTime,
      outcomes,
      rulebook: {
        ...base.rulebook,
        sourceRaw:
          `${base.rulebook.sourceRaw}\n\nGrouped from binary sibling markets. ` +
          `Official winner inferred from child market resolutions.`,
      },
      rawPayload: {
        polymarket_v2_grouped: true,
        polymarket_v2_group_children: sourceChildren,
      },
      provenance: {
        ...base.provenance,
        externalId: syntheticExternalId,
        sourceUrl: base.sourceUrl,
        riskFlags: [...new Set([...(base.provenance.riskFlags ?? []), "grouped_from_binary_siblings"])],
      },
    });

    groupedClusterCount += 1;
    groupedSourceMarketsCount += sourceChildren.length;
  }

  const residual = markets.filter((market) => !consumedExternalIds.has(market.externalId));
  return {
    groupedMarkets: [...residual, ...syntheticMarkets],
    groupedClusterCount,
    groupedSourceMarketsCount,
  };
}

