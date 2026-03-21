import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type SourceDefinitionId = Branded<string, "SourceDefinitionId">;

export const createSourceDefinitionId = (value: string): SourceDefinitionId =>
  createPrefixedId(value, "sdef_", "SourceDefinitionId") as SourceDefinitionId;
