import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";

export type ActionPermission = Branded<string, "ActionPermission">;

export const createActionPermission = (value: string): ActionPermission =>
  createNonEmptyTrimmed(value, "INVALID_ACTION_PERMISSION", "action_permission") as ActionPermission;
