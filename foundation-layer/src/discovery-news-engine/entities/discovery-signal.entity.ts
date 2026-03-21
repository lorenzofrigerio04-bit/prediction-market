import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoverySignalId } from "../value-objects/discovery-signal-id.vo.js";
import type { DiscoverySignalTimeWindow } from "../value-objects/discovery-signal-time-window.vo.js";
import type { DiscoverySignalEvidenceRef } from "../value-objects/discovery-signal-evidence-ref.vo.js";
import { DiscoverySignalFreshnessClass } from "../enums/discovery-signal-freshness-class.enum.js";
import { DiscoverySignalKind } from "../enums/discovery-signal-kind.enum.js";
import { DiscoverySignalPriorityHint } from "../enums/discovery-signal-priority-hint.enum.js";
import { DiscoverySignalStatus } from "../enums/discovery-signal-status.enum.js";
import type { DiscoveryProvenanceMetadata } from "./discovery-provenance-metadata.entity.js";
import type { NormalizedExternalItemId } from "../value-objects/discovery-signal-evidence-ref.vo.js";

export type DiscoverySignalPayloadRef = Readonly<{
  normalizedItemId: NormalizedExternalItemId;
}>;

export type DiscoverySignal = Readonly<{
  id: DiscoverySignalId;
  kind: DiscoverySignalKind;
  payloadRef: DiscoverySignalPayloadRef;
  timeWindow: DiscoverySignalTimeWindow;
  freshnessClass: DiscoverySignalFreshnessClass;
  priorityHint: DiscoverySignalPriorityHint;
  status: DiscoverySignalStatus;
  evidenceRefs: readonly DiscoverySignalEvidenceRef[];
  provenanceMetadata: DiscoveryProvenanceMetadata;
  createdAt: Timestamp;
}>;

export const createDiscoverySignal = (input: DiscoverySignal): DiscoverySignal =>
  deepFreeze({
    ...input,
    evidenceRefs: [...input.evidenceRefs],
  });
