import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { ConsumptionStatus } from "../../enums/consumption-status.enum.js";
import type {
  ActionKey,
  CreditConsumptionEventId,
  Note,
  RelatedRef,
  Version,
  VirtualCreditAccountId,
} from "../../value-objects/index.js";

export type CreditConsumptionEvent = Readonly<{
  id: CreditConsumptionEventId;
  version: Version;
  account_id: VirtualCreditAccountId;
  action_key: ActionKey;
  consumption_amount: number;
  consumed_at: Timestamp;
  related_entity_ref_nullable: RelatedRef | null;
  quota_evaluation_ref_nullable: RelatedRef | null;
  consumption_status: ConsumptionStatus;
  notes_nullable: Note | null;
}>;

export const createCreditConsumptionEvent = (input: CreditConsumptionEvent): CreditConsumptionEvent =>
  deepFreeze({ ...input });
