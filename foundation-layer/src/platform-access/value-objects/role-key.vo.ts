import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";

export type RoleKey = Branded<string, "RoleKey">;

export const createRoleKey = (value: string): RoleKey =>
  createNonEmptyTrimmed(value, "INVALID_ROLE_KEY", "role_key") as RoleKey;
