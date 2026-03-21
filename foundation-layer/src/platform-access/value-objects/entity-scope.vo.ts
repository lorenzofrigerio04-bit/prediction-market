import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";

export type EntityScope = Branded<string, "EntityScope">;

export const createEntityScope = (value: string): EntityScope =>
  createNonEmptyTrimmed(value, "INVALID_ENTITY_SCOPE", "entity_scope") as EntityScope;
