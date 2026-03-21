import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { SourceDefinition } from "../entities/source-definition.entity.js";

export type FetchRawRequest = Readonly<{
  sourceDefinition: SourceDefinition;
  requestedAt: Timestamp;
  cursorNullable: string | null;
}>;
