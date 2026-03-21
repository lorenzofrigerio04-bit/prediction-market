import type { DiscoverySignalKind } from "../enums/discovery-signal-kind.enum.js";
import type { DiscoverySignalPriorityHint } from "../enums/discovery-signal-priority-hint.enum.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";

export type DiscoverySignalBuildInput =
  | NormalizedDiscoveryItem
  | NormalizedDiscoveryPayload;

export type DiscoverySignalBuildOptions = Readonly<{
  kindNullable?: DiscoverySignalKind | null;
  priorityHintNullable?: DiscoverySignalPriorityHint | null;
}>;

export interface DiscoverySignalBuilder {
  build(
    input: DiscoverySignalBuildInput,
    options?: DiscoverySignalBuildOptions,
  ): DiscoverySignal | readonly DiscoverySignal[];
}
