import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { QuotaDecisionStatus } from "../../enums/quota-decision-status.enum.js";
import type {
  ActionKey,
  Note,
  QuotaEvaluationId,
  QuotaPolicyId,
  Version,
  VirtualCreditAccountId,
} from "../../value-objects/index.js";

export type QuotaEvaluation = Readonly<{
  id: QuotaEvaluationId;
  version: Version;
  policy_id: QuotaPolicyId;
  target_account_id: VirtualCreditAccountId;
  evaluated_action_key: ActionKey;
  current_usage: number;
  requested_usage: number;
  decision_status: QuotaDecisionStatus;
  blocking_reasons: readonly Note[];
  evaluated_at: Timestamp;
}>;

export const createQuotaEvaluation = (input: QuotaEvaluation): QuotaEvaluation => deepFreeze({ ...input });
