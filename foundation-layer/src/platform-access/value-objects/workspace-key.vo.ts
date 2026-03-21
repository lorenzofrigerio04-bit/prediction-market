import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";

export type WorkspaceKey = Branded<string, "WorkspaceKey">;

export const createWorkspaceKey = (value: string): WorkspaceKey =>
  createNonEmptyTrimmed(value, "INVALID_WORKSPACE_KEY", "workspace_key") as WorkspaceKey;
