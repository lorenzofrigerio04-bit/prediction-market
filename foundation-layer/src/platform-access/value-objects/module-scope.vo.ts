import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";

export type ModuleScope = Branded<string, "ModuleScope">;

export const createModuleScope = (value: string): ModuleScope =>
  createNonEmptyTrimmed(value, "INVALID_MODULE_SCOPE", "module_scope") as ModuleScope;
