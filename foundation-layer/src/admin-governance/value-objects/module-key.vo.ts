import type { Branded } from "../../common/types/branded.js";
import { createNonEmpty } from "./shared.vo.js";

export type ModuleKey = Branded<string, "ModuleKey">;

export const createModuleKey = (value: string): ModuleKey =>
  createNonEmpty(value, "module_key") as ModuleKey;
