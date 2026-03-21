import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActionKey } from "../../enums/action-key.enum.js";
import { VisibilityStatus } from "../../enums/visibility-status.enum.js";
import type { PermissionAwareViewStateId } from "../../value-objects/operations-console-ids.vo.js";
import type { PermissionEvaluationBasis } from "./permission-evaluation-basis.entity.js";

export type PermissionAwareViewState = Readonly<{
  id: PermissionAwareViewStateId;
  version: string;
  user_id: string;
  workspace_id_nullable: string | null;
  target_view_key: string;
  visibility_status: VisibilityStatus;
  allowed_actions: readonly ActionKey[];
  denied_actions: readonly ActionKey[];
  evaluation_basis: PermissionEvaluationBasis;
}>;

export const createPermissionAwareViewState = (input: PermissionAwareViewState): PermissionAwareViewState =>
  deepFreeze({ ...input });
