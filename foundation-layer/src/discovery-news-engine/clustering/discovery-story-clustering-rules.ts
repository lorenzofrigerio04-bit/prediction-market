/**
 * Conservative deterministic rules for story clustering v1.
 * Order: canonical URL → source identity → structured locator → title + temporal.
 * Geo/topic are supporting only (no join solely on geo/topic).
 */

import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoveryStoryCluster } from "../entities/discovery-story-cluster.entity.js";
import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import { DiscoveryStoryMembershipReason } from "../enums/discovery-story-membership-reason.enum.js";
import { DiscoveryDedupeEvidenceStrength } from "../enums/discovery-dedupe-evidence-strength.enum.js";
import { STRUCTURED_SOURCE_KEYS_FOR_LOCATOR } from "../dedupe/discovery-dedupe-keys.js";

export type StoryClusterMatchResult = Readonly<{
  match: true;
  clusterId: DiscoveryStoryClusterId;
  reason: DiscoveryStoryMembershipReason;
  matchedMemberId: string;
  evidenceStrength: DiscoveryDedupeEvidenceStrength;
}>;

export type StoryClusterNoMatch = Readonly<{ match: false }>;

export type StoryClusterRuleResult = StoryClusterMatchResult | StoryClusterNoMatch;

function getSourceKey(item: NormalizedDiscoveryItem): string {
  return item.sourceReference.sourceKeyNullable != null
    ? String(item.sourceReference.sourceKeyNullable).trim()
    : String(item.sourceReference.sourceId).trim();
}

function normalizeHeadline(headline: string): string {
  return headline
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Same calendar day (UTC) for temporal proximity. */
function toDayBucket(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/**
 * Find first cluster whose members (resolved to items) satisfy the given predicate.
 * Returns the first (clusterId, memberItemId) that matches.
 */
function findClusterWithMember(
  clusters: readonly DiscoveryStoryCluster[],
  getItem: (id: string) => NormalizedDiscoveryItem | null,
  predicate: (memberItem: NormalizedDiscoveryItem, memberItemId: string) => boolean,
): { clusterId: DiscoveryStoryClusterId; memberItemId: string } | null {
  for (const cluster of clusters) {
    for (const itemId of cluster.memberItemIds) {
      const memberItem = getItem(itemId);
      if (memberItem && predicate(memberItem, itemId)) {
        return { clusterId: cluster.clusterId, memberItemId: itemId };
      }
    }
  }
  return null;
}

/**
 * Run rule set v1 in order. Returns first match or no match.
 * Candidate must be the normalized item (for signals, resolve via getItemForNormalizedId first).
 */
export function evaluateStoryClusterRules(
  candidate: NormalizedDiscoveryItem,
  candidateItemId: string,
  existingClusters: readonly DiscoveryStoryCluster[],
  getItemForNormalizedId: (id: string) => NormalizedDiscoveryItem | null,
): StoryClusterRuleResult {
  const getItem = getItemForNormalizedId;

  // 1. Canonical URL continuity
  const urlNorm = candidate.canonicalUrl?.trim();
  if (urlNorm) {
    const found = findClusterWithMember(
      existingClusters,
      getItem,
      (member) => (member.canonicalUrl?.trim() ?? "") === urlNorm,
    );
    if (found) {
      return {
        match: true,
        clusterId: found.clusterId,
        reason: DiscoveryStoryMembershipReason.CANONICAL_URL_CONTINUITY,
        matchedMemberId: found.memberItemId,
        evidenceStrength: DiscoveryDedupeEvidenceStrength.STRONG,
      };
    }
  }

  // 2. Same external/source identity
  const sourceKey = getSourceKey(candidate);
  if (sourceKey && candidate.externalItemId?.trim()) {
    const extId = candidate.externalItemId.trim();
    const found = findClusterWithMember(
      existingClusters,
      getItem,
      (member) => getSourceKey(member) === sourceKey && (member.externalItemId?.trim() ?? "") === extId,
    );
    if (found) {
      return {
        match: true,
        clusterId: found.clusterId,
        reason: DiscoveryStoryMembershipReason.SOURCE_IDENTITY_CONTINUITY,
        matchedMemberId: found.memberItemId,
        evidenceStrength: DiscoveryDedupeEvidenceStrength.STRONG,
      };
    }
  }

  // 3. Structured-source continuity
  const locator = candidate.sourceReference.locator?.trim();
  if (sourceKey && locator && STRUCTURED_SOURCE_KEYS_FOR_LOCATOR.has(sourceKey)) {
    const found = findClusterWithMember(
      existingClusters,
      getItem,
      (member) =>
        getSourceKey(member) === sourceKey &&
        (member.sourceReference.locator?.trim() ?? "") === locator,
    );
    if (found) {
      return {
        match: true,
        clusterId: found.clusterId,
        reason: DiscoveryStoryMembershipReason.STRUCTURED_SOURCE_LOCATOR,
        matchedMemberId: found.memberItemId,
        evidenceStrength: DiscoveryDedupeEvidenceStrength.STRONG,
      };
    }
  }

  // 4. Title + narrow temporal proximity (same normalized headline + same calendar day)
  const candidateHeadlineNorm = normalizeHeadline(candidate.headline ?? "");
  const candidateDay = candidate.publishedAt ? toDayBucket(candidate.publishedAt) : "";
  if (candidateHeadlineNorm && candidateDay) {
    const found = findClusterWithMember(
      existingClusters,
      getItem,
      (member) =>
        normalizeHeadline(member.headline ?? "") === candidateHeadlineNorm &&
        (member.publishedAt ? toDayBucket(member.publishedAt) === candidateDay : false),
    );
    if (found) {
      return {
        match: true,
        clusterId: found.clusterId,
        reason: DiscoveryStoryMembershipReason.TITLE_AND_TEMPORAL_PROXIMITY,
        matchedMemberId: found.memberItemId,
        evidenceStrength: DiscoveryDedupeEvidenceStrength.MEDIUM,
      };
    }
  }

  // 5. Geo/topic: supporting only — no join solely on geo/topic; fall through to no match.
  // 6. No match
  return { match: false };
}
