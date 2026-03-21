/**
 * Discovery lead supplier: orchestration layer that composes the discovery engine
 * (registry → connectors/adapters → dedupe → cluster → trend → rank → event lead extraction)
 * and returns EventLead[] plus a structured report.
 *
 * No new domain logic; uses only existing foundation discovery components.
 */

import type { EventLead } from "@market-design-engine/foundation-layer";
import {
  discoverySourceRegistry,
  getAdapterByKey,
  createDiscoveryFetchRequest,
  runConnectorWithNormalize,
  createTimestamp,
  DiscoverySourceStatus,
  DiscoverySourceUsageRole,
  DiscoverySourceKind,
  DiscoveryDedupeOutcome,
  DiscoveryGeoScope,
  EventLeadReadiness,
  discoveryDedupeEvaluator,
  discoveryStoryClusterEvaluator,
  discoveryTrendEvaluator,
  discoveryRankingEvaluator,
  eventLeadExtractionEvaluator,
  buildDiscoveryStoryClusterSummary,
  deterministicDiscoverySignalBuilder,
} from "@market-design-engine/foundation-layer";
import type { DiscoverySourceCatalogEntry } from "@market-design-engine/foundation-layer";
import { getResolvedSourceDefinition } from "./discovery-source-resolver";
import type { NormalizedDiscoveryItem } from "@market-design-engine/foundation-layer";
import type { DiscoverySignal } from "@market-design-engine/foundation-layer";
import type { DiscoveryStoryCluster } from "@market-design-engine/foundation-layer";
import type { DiscoveryStoryClusterSummary } from "@market-design-engine/foundation-layer";
import type { DiscoveryTrendSnapshot } from "@market-design-engine/foundation-layer";
/** Optional filters for source selection. */
export interface DiscoveryLeadSupplierOptions {
  /** Include only these source keys (intersection with enabled + has adapter). */
  sourceKeys?: string[];
  /** Include only sources with this role. */
  role?: DiscoverySourceUsageRole;
  /** Include only sources of this kind. */
  kind?: DiscoverySourceKind;
  /** Time used for fetch requestedAt and trend evaluation. Default now. */
  now?: Date;
}

/** Per-source failure for report. */
export interface DiscoveryLeadSupplierSourceFailure {
  sourceKey: string;
  reason: string;
}

/** Dedupe stage stats. */
export interface DiscoveryLeadSupplierDedupeStats {
  input: number;
  accepted: number;
  duplicateWithinRun: number;
  duplicateOfExisting: number;
}

/** Structured supplier result report. */
export interface DiscoveryLeadSupplierReport {
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  sourceFailures: DiscoveryLeadSupplierSourceFailure[];
  normalizedItemsCount: number;
  signalsCount: number;
  dedupeStats: DiscoveryLeadSupplierDedupeStats;
  clusterCount: number;
  trendSnapshotCount: number;
  rankedClusterCount: number;
  eventLeadCount: number;
  nonLeadOrSkippedCount: number;
  errorsSummary: string[];
}

export interface DiscoveryLeadSupplierResult {
  leads: EventLead[];
  report: DiscoveryLeadSupplierReport;
}

function defaultReport(): DiscoveryLeadSupplierReport {
  return {
    sourcesAttempted: 0,
    sourcesSucceeded: 0,
    sourcesFailed: 0,
    sourceFailures: [],
    normalizedItemsCount: 0,
    signalsCount: 0,
    dedupeStats: { input: 0, accepted: 0, duplicateWithinRun: 0, duplicateOfExisting: 0 },
    clusterCount: 0,
    trendSnapshotCount: 0,
    rankedClusterCount: 0,
    eventLeadCount: 0,
    nonLeadOrSkippedCount: 0,
    errorsSummary: [],
  };
}

const ISTAT_SOURCE_KEY = "istat-sdmx";
/** ISTAT consente max 5 richieste/minuto per IP; usiamo 1/min per evitare ban. */
const ISTAT_COOLDOWN_MS = 60_000;
let lastIstatFetchTime: number | null = null;

function shouldSkipIstatRateLimit(now: Date): boolean {
  if (lastIstatFetchTime === null) return false;
  return now.getTime() - lastIstatFetchTime < ISTAT_COOLDOWN_MS;
}

function selectSources(options?: DiscoveryLeadSupplierOptions): DiscoverySourceCatalogEntry[] {
  let entries = discoverySourceRegistry.getByStatus(DiscoverySourceStatus.ENABLED);
  if (options?.sourceKeys != null && options.sourceKeys.length > 0) {
    const set = new Set(options.sourceKeys);
    entries = entries.filter((e) => set.has(String(e.key)));
  }
  if (options?.role != null) {
    const byRole = discoverySourceRegistry.getByRole(options.role);
    const roleSet = new Set(byRole.map((e) => String(e.key)));
    entries = entries.filter((e) => roleSet.has(String(e.key)));
  }
  if (options?.kind != null) {
    entries = entries.filter((e) => e.kind === options.kind);
  }
  return entries.filter((entry) => getAdapterByKey(entry.key) != null);
}

/**
 * Runs the full discovery pipeline and returns READY EventLeads plus a structured report.
 * Partial source failures do not throw; they are recorded in report.sourceFailures.
 */
export async function runDiscoveryLeadSupplier(
  options?: DiscoveryLeadSupplierOptions
): Promise<DiscoveryLeadSupplierResult> {
  const now = options?.now ?? new Date();
  const report = defaultReport();
  const allItems: NormalizedDiscoveryItem[] = [];
  const allSignals: DiscoverySignal[] = [];

  const entries = selectSources(options);
  report.sourcesAttempted = entries.length;

  for (const entry of entries) {
    const sourceKey = String(entry.key);
    const adapter = getAdapterByKey(entry.key);
    if (!adapter) continue;

    if (sourceKey === ISTAT_SOURCE_KEY && shouldSkipIstatRateLimit(now)) {
      report.sourcesFailed += 1;
      report.sourceFailures.push({
        sourceKey: ISTAT_SOURCE_KEY,
        reason: "Rate limit: max 1 request per minute (ISTAT policy); skip per evitare ban",
      });
      continue;
    }

    try {
      const sourceDefinition = getResolvedSourceDefinition(entry);
      const request = createDiscoveryFetchRequest({
        sourceDefinition,
        requestedAt: createTimestamp(now),
        cursorNullable: null,
      });
      const result = await runConnectorWithNormalize(
        request,
        adapter.connector,
        adapter.normalizer
      );

      if (result.outcome === "success" || result.outcome === "partial") {
        if (sourceKey === ISTAT_SOURCE_KEY) lastIstatFetchTime = Date.now();
        report.sourcesSucceeded += 1;
        const payload = result.normalizedPayload;
        for (const item of payload.items) {
          allItems.push(item);
        }
        const signalsOut = deterministicDiscoverySignalBuilder.build(payload);
        const signals = Array.isArray(signalsOut) ? signalsOut : [signalsOut];
        for (const sig of signals) {
          allSignals.push(sig);
        }
      } else {
        report.sourcesFailed += 1;
        const reason =
          result.outcome === "fetch_failure"
            ? result.failure?.message ?? "fetch_failure"
            : result.outcome === "parse_failure"
              ? result.message
              : result.outcome === "unsupported_shape"
                ? result.message
                : result.outcome === "invalid_input"
                  ? result.message
                  : String(result.outcome);
        report.sourceFailures.push({ sourceKey, reason });
      }
    } catch (err) {
      report.sourcesFailed += 1;
      const message = err instanceof Error ? err.message : String(err);
      report.sourceFailures.push({ sourceKey, reason: message });
      report.errorsSummary.push(`${sourceKey}: ${message}`);
    }
  }

  report.normalizedItemsCount = allItems.length;
  report.signalsCount = allSignals.length;

  if (allItems.length === 0) {
    report.eventLeadCount = 0;
    return { leads: [], report };
  }

  const getItemForNormalizedId = (id: string) =>
    allItems.find((i) => (i.externalItemId ?? "") === id) ?? null;
  const priorItems: readonly NormalizedDiscoveryItem[] = [];
  const priorSignals: readonly DiscoverySignal[] = [];

  const acceptedItems: NormalizedDiscoveryItem[] = [];
  let duplicateWithinRun = 0;
  let duplicateOfExisting = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const dedupeContext = {
      withinRunItems: acceptedItems,
      priorItems,
      withinRunSignals: allSignals,
      priorSignals,
      getItemForNormalizedId,
    };
    const decision = discoveryDedupeEvaluator.evaluateItem(item, dedupeContext);
    if (
      decision.outcome === DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN
    ) {
      duplicateWithinRun += 1;
    } else if (
      decision.outcome === DiscoveryDedupeOutcome.DUPLICATE_OF_EXISTING
    ) {
      duplicateOfExisting += 1;
    } else {
      acceptedItems.push(item);
    }
  }

  const acceptedSignals: DiscoverySignal[] = [];
  for (let j = 0; j < allSignals.length; j++) {
    const sig = allSignals[j];
    const priorSignalItemIds = new Set(
      allSignals.slice(0, j).map((s) => s.payloadRef.normalizedItemId)
    );
    const withinRunItemsForSignals = allItems.filter((it) =>
      priorSignalItemIds.has(it.externalItemId ?? "")
    );
    const dedupeContext = {
      withinRunItems: withinRunItemsForSignals,
      priorItems,
      withinRunSignals: allSignals.slice(0, j),
      priorSignals,
      getItemForNormalizedId,
    };
    const decision = discoveryDedupeEvaluator.evaluateSignal(sig, dedupeContext);
    if (
      decision.outcome !== DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN &&
      decision.outcome !== DiscoveryDedupeOutcome.DUPLICATE_OF_EXISTING
    ) {
      acceptedSignals.push(sig);
    }
  }

  report.dedupeStats = {
    input: allItems.length,
    accepted: acceptedItems.length,
    duplicateWithinRun,
    duplicateOfExisting,
  };

  if (acceptedItems.length === 0 && acceptedSignals.length === 0) {
    report.clusterCount = 0;
    report.eventLeadCount = 0;
    return { leads: [], report };
  }

  const clusterResult = discoveryStoryClusterEvaluator.assignToClusters(
    { items: acceptedItems, signals: acceptedSignals },
    { existingClusters: [] }
  );

  const clusters = clusterResult.clusters;
  report.clusterCount = clusters.length;

  if (clusters.length === 0) {
    report.trendSnapshotCount = 0;
    report.rankedClusterCount = 0;
    report.eventLeadCount = 0;
    return { leads: [], report };
  }

  const itemsById = new Map<string, NormalizedDiscoveryItem>();
  for (const item of acceptedItems) {
    const id = item.externalItemId ?? "";
    if (id) itemsById.set(id, item);
  }
  const signalsById = new Map<string, DiscoverySignal>();
  for (const sig of acceptedSignals) {
    const id = typeof sig.id === "string" ? sig.id : String(sig.id);
    signalsById.set(id, sig);
  }

  const summariesByClusterId = new Map<string, DiscoveryStoryClusterSummary>();
  for (const cluster of clusters) {
    const summary = buildDiscoveryStoryClusterSummary(
      cluster,
      itemsById,
      signalsById
    );
    summariesByClusterId.set(String(cluster.clusterId), summary);
  }

  const snapshotsByClusterId = new Map<string, readonly DiscoveryTrendSnapshot[]>();
  let trendSnapshotCount = 0;
  const itSources = new Set(
    discoverySourceRegistry.getByGeoScope(DiscoveryGeoScope.IT).map((e) => String(e.key))
  );
  const getSourceRoleNullable = (sourceKey: string): DiscoverySourceUsageRole | null => {
    const entry = discoverySourceRegistry.getByKey(sourceKey);
    return entry?.role ?? null;
  };

  for (const cluster of clusters) {
    const summary = summariesByClusterId.get(String(cluster.clusterId));
    if (!summary) continue;
    const trendResult = discoveryTrendEvaluator.evaluateCluster({
      cluster,
      summary,
      itemsById,
      signalsById,
      now,
      getSourceRoleNullable,
    });
    snapshotsByClusterId.set(String(cluster.clusterId), trendResult.snapshots);
    trendSnapshotCount += trendResult.snapshots.length;
  }
  report.trendSnapshotCount = trendSnapshotCount;

  const rankingResult = discoveryRankingEvaluator.rank({
    clusters,
    summariesByClusterId,
    snapshotsByClusterId,
    itemsById,
    signalsById,
    isItalianSourceKey: (key) => itSources.has(key),
    getSourceRoleNullable,
  });

  const rankedEntries = rankingResult.entries;
  report.rankedClusterCount = rankedEntries.length;

  const extractionResult = eventLeadExtractionEvaluator.extract({
    rankedEntries,
    summariesByClusterId,
    snapshotsByClusterId,
    itemsById,
    signalsById,
  });

  const leads: EventLead[] = [];
  let nonLeadOrSkippedCount = 0;
  for (const decision of extractionResult.decisions) {
    if (decision.outcome === "lead" && decision.lead.readiness === EventLeadReadiness.READY) {
      leads.push(decision.lead);
    } else {
      nonLeadOrSkippedCount += 1;
    }
  }
  report.eventLeadCount = leads.length;
  report.nonLeadOrSkippedCount = nonLeadOrSkippedCount;

  return { leads, report };
}

/**
 * Returns EventLead[] for the discovery-backed pipeline.
 * Thin wrapper around runDiscoveryLeadSupplier; returns only READY leads.
 */
export async function buildDiscoveryEventLeads(
  options?: DiscoveryLeadSupplierOptions
): Promise<EventLead[]> {
  const { leads } = await runDiscoveryLeadSupplier(options);
  return leads;
}
