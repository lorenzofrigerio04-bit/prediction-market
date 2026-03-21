import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { RiskSeverity } from "../../enums/risk-severity.enum.js";
import { RiskType } from "../../enums/risk-type.enum.js";
import type {
  AbuseRiskFlagId,
  MitigationNote,
  OwnerRef,
  RelatedRef,
  Version,
} from "../../value-objects/index.js";

export type AbuseRiskFlag = Readonly<{
  id: AbuseRiskFlagId;
  version: Version;
  target_owner_ref: OwnerRef;
  risk_type: RiskType;
  severity: RiskSeverity;
  detected_at: Timestamp;
  related_refs: readonly RelatedRef[];
  active: boolean;
  mitigation_notes_nullable: MitigationNote | null;
}>;

export const createAbuseRiskFlag = (input: AbuseRiskFlag): AbuseRiskFlag => deepFreeze({ ...input });
