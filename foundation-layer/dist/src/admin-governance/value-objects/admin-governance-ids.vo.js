import { createPrefixedId } from "../../common/utils/id.js";
export const createAdminFeatureFlagId = (value) => createPrefixedId(value, "agf_", "AdminFeatureFlagId");
export const createGovernanceModuleId = (value) => createPrefixedId(value, "agm_", "GovernanceModuleId");
export const createGovernanceSourceId = (value) => createPrefixedId(value, "ags_", "GovernanceSourceId");
export const createGuardrailPolicyId = (value) => createPrefixedId(value, "agr_", "GuardrailPolicyId");
export const createEmergencyControlId = (value) => createPrefixedId(value, "age_", "EmergencyControlId");
export const createOverrideRequestId = (value) => createPrefixedId(value, "ago_", "OverrideRequestId");
export const createGovernanceEnvironmentId = (value) => createPrefixedId(value, "agev_", "GovernanceEnvironmentId");
export const createGovernanceDecisionId = (value) => createPrefixedId(value, "agd_", "GovernanceDecisionId");
export const createGovernanceAuditLinkId = (value) => createPrefixedId(value, "aga_", "GovernanceAuditLinkId");
export const createGovernanceCompatibilityViewId = (value) => createPrefixedId(value, "agc_", "GovernanceCompatibilityViewId");
//# sourceMappingURL=admin-governance-ids.vo.js.map