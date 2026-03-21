import type { Branded } from "../../common/types/branded.js";
import { createNonEmpty } from "./shared.vo.js";

export type EnvironmentKey = Branded<string, "EnvironmentKey">;

export const createEnvironmentKey = (value: string): EnvironmentKey =>
  createNonEmpty(value, "environment_key") as EnvironmentKey;
