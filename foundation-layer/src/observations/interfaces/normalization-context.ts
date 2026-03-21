import type { Timestamp } from "../../value-objects/timestamp.vo.js";

export type NormalizationContext = Readonly<{
  requestedAt: Timestamp;
  normalizerVersion: string;
  sourceRunId: string | null;
}>;
