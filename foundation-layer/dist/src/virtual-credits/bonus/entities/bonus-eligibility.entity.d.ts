import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { BonusType } from "../../enums/bonus-type.enum.js";
import { EligibilityStatus } from "../../enums/eligibility-status.enum.js";
import type { BonusEligibilityId, Note, OwnerRef, RelatedRef, Version } from "../../value-objects/index.js";
export type BonusEligibility = Readonly<{
    id: BonusEligibilityId;
    version: Version;
    target_owner_ref: OwnerRef;
    bonus_type: BonusType;
    eligibility_status: EligibilityStatus;
    evaluated_at: Timestamp;
    blocking_reasons: readonly Note[];
    supporting_refs: readonly RelatedRef[];
}>;
export declare const createBonusEligibility: (input: BonusEligibility) => BonusEligibility;
//# sourceMappingURL=bonus-eligibility.entity.d.ts.map