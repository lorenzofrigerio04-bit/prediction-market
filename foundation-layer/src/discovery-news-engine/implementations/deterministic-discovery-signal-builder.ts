import type { DiscoverySignalBuilder } from "../interfaces/discovery-signal-builder.js";
import type { DiscoverySignalBuildInput, DiscoverySignalBuildOptions } from "../interfaces/discovery-signal-builder.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import type { DiscoveryProvenanceMetadata } from "../entities/discovery-provenance-metadata.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import { createDiscoverySignal } from "../entities/discovery-signal.entity.js";
import { createDiscoveryProvenanceMetadata } from "../entities/discovery-provenance-metadata.entity.js";
import { createDiscoverySignalId } from "../value-objects/discovery-signal-id.vo.js";
import { createDiscoverySignalTimeWindow } from "../value-objects/discovery-signal-time-window.vo.js";
import { createDiscoverySignalEvidenceRef } from "../value-objects/discovery-signal-evidence-ref.vo.js";
import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import type { DiscoverySourceId } from "../value-objects/discovery-source-id.vo.js";
import { DiscoverySignalKind } from "../enums/discovery-signal-kind.enum.js";
import { DiscoverySignalFreshnessClass } from "../enums/discovery-signal-freshness-class.enum.js";
import { DiscoverySignalPriorityHint } from "../enums/discovery-signal-priority-hint.enum.js";
import { DiscoverySignalStatus } from "../enums/discovery-signal-status.enum.js";
import { DiscoveryEvidenceRole } from "../enums/discovery-evidence-role.enum.js";
import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";

const SIGNAL_ID_BODY_MAX = 64;
const SIGNAL_ID_BODY_MIN = 6;

function slugForSignalId(sourceId: string, externalItemId: string): string {
  const raw = `${sourceId}_${externalItemId}`.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
  let body = raw.slice(0, SIGNAL_ID_BODY_MAX);
  if (body.length < SIGNAL_ID_BODY_MIN) {
    body = (body + "000000").slice(0, SIGNAL_ID_BODY_MIN);
  }
  if (!/^[a-zA-Z0-9]/.test(body)) {
    body = "s" + body.slice(0, SIGNAL_ID_BODY_MAX - 1);
  }
  return body;
}

function timeWindowFromPublishedAt(publishedAt: string): { start: string; end: string } {
  const t = new Date(publishedAt).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return {
    start: new Date(t - dayMs).toISOString(),
    end: new Date(t + dayMs).toISOString(),
  };
}

function buildSignalFromItem(
  item: NormalizedDiscoveryItem,
  sourceId: DiscoverySourceId,
  provenanceMetadata: DiscoveryProvenanceMetadata,
  options?: DiscoverySignalBuildOptions,
): DiscoverySignal {
  const kind = options?.kindNullable ?? DiscoverySignalKind.HEADLINE;
  const priorityHint = options?.priorityHintNullable ?? DiscoverySignalPriorityHint.NORMAL;
  const body = slugForSignalId(String(sourceId), item.externalItemId);
  const id = createDiscoverySignalId(`dsig_${body}`);
  const { start, end } = timeWindowFromPublishedAt(item.publishedAt);
  const timeWindow = createDiscoverySignalTimeWindow({
    start: createTimestamp(start),
    end: createTimestamp(end),
  });
  return createDiscoverySignal({
    id,
    kind,
    payloadRef: { normalizedItemId: item.externalItemId },
    timeWindow,
    freshnessClass: DiscoverySignalFreshnessClass.RECENT,
    priorityHint,
    status: DiscoverySignalStatus.PENDING,
    evidenceRefs: [
      createDiscoverySignalEvidenceRef({
        itemId: item.externalItemId,
        role: DiscoveryEvidenceRole.PRIMARY,
      }),
    ],
    provenanceMetadata,
    createdAt: provenanceMetadata.fetchedAt,
  });
}

/**
 * Minimal deterministic DiscoverySignalBuilder.
 * One signal per normalized item; id and timeWindow derived from item and source.
 */
export const deterministicDiscoverySignalBuilder: DiscoverySignalBuilder = {
  build(
    input: DiscoverySignalBuildInput,
    options?: DiscoverySignalBuildOptions,
  ): DiscoverySignal | readonly DiscoverySignal[] {
    const items: readonly NormalizedDiscoveryItem[] = Array.isArray((input as NormalizedDiscoveryPayload).items)
      ? (input as NormalizedDiscoveryPayload).items
      : [input as NormalizedDiscoveryItem];
    const payload = input as NormalizedDiscoveryPayload;
    const sourceId: DiscoverySourceId =
      "sourceId" in payload && payload.sourceId
        ? (payload.sourceId as DiscoverySourceId)
        : items[0]!.sourceReference.sourceId;
    const provenanceMetadata: DiscoveryProvenanceMetadata =
      "provenanceMetadata" in payload && payload.provenanceMetadata
        ? payload.provenanceMetadata
        : createDiscoveryProvenanceMetadata({
            fetchedAt: createTimestamp(new Date().toISOString()),
            sourceDefinitionId: sourceId,
            runIdNullable: null,
            sourceKey: items[0]!.sourceReference.sourceKeyNullable ?? createDiscoverySourceKey("unknown"),
            sourceRoleNullable: null,
            sourceTier: DiscoverySourceTier.SECONDARY,
            trustTier: DiscoveryTrustTier.UNVERIFIED,
            endpointReferenceNullable: null,
            adapterKeyNullable: null,
            fetchMetadataNullable: null,
          });

    if (items.length === 1) {
      return buildSignalFromItem(items[0]!, sourceId, provenanceMetadata, options);
    }
    return items.map((item) =>
      buildSignalFromItem(item, sourceId, provenanceMetadata, options),
    ) as readonly DiscoverySignal[];
  },
};
