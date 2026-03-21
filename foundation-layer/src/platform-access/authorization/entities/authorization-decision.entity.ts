import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActionKey } from "../../enums/action-key.enum.js";
import { DecisionStatus } from "../../enums/decision-status.enum.js";
import type { BlockingReason } from "../../value-objects/blocking-reason.vo.js";
import type {
  AuthorizationDecisionId,
  RoleDefinitionId,
  PermissionPolicyId,
  UserIdentityId,
} from "../../value-objects/platform-access-ids.vo.js";
import type { AccessScope } from "../../scopes/entities/access-scope.entity.js";
import type { VersionTag } from "../../value-objects/version-tag.vo.js";

export type AuthorizationDecision = Readonly<{
  id: AuthorizationDecisionId;
  version: VersionTag;
  user_id: UserIdentityId;
  requested_action: ActionKey;
  evaluated_scope: AccessScope;
  decision_status: DecisionStatus;
  matched_roles: readonly RoleDefinitionId[];
  matched_policies: readonly PermissionPolicyId[];
  blocking_reasons: readonly BlockingReason[];
  evaluated_at: string;
}>;

export const createAuthorizationDecision = (input: AuthorizationDecision): AuthorizationDecision => {
  if (!Object.values(ActionKey).includes(input.requested_action)) {
    throw new ValidationError("INVALID_AUTHORIZATION_DECISION", "requested_action is invalid");
  }
  if (!Object.values(DecisionStatus).includes(input.decision_status)) {
    throw new ValidationError("INVALID_AUTHORIZATION_DECISION", "decision_status is invalid");
  }
  if (input.decision_status === DecisionStatus.DENIED && input.blocking_reasons.length === 0) {
    throw new ValidationError(
      "INVALID_AUTHORIZATION_DECISION",
      "DENIED decision requires at least one blocking reason",
    );
  }
  if (input.decision_status === DecisionStatus.ALLOWED && input.blocking_reasons.length > 0) {
    throw new ValidationError(
      "INVALID_AUTHORIZATION_DECISION",
      "ALLOWED decision must not include blocking reasons",
    );
  }
  return deepFreeze({
    ...input,
    matched_roles: deepFreeze([...input.matched_roles]),
    matched_policies: deepFreeze([...input.matched_policies]),
    blocking_reasons: deepFreeze([...input.blocking_reasons]),
  });
};
