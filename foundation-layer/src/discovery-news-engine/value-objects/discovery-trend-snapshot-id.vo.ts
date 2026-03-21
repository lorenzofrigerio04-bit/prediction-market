import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type DiscoveryTrendSnapshotId = Branded<string, "DiscoveryTrendSnapshotId">;

export const createDiscoveryTrendSnapshotId = (
  value: string,
): DiscoveryTrendSnapshotId =>
  createPrefixedId(value, "dts_", "DiscoveryTrendSnapshotId") as DiscoveryTrendSnapshotId;
