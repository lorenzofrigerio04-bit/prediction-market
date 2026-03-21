import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type AdminFeatureFlagId = Branded<string, "AdminFeatureFlagId">;
export type GovernanceModuleId = Branded<string, "GovernanceModuleId">;
export type GovernanceSourceId = Branded<string, "GovernanceSourceId">;
export type GuardrailPolicyId = Branded<string, "GuardrailPolicyId">;
export type EmergencyControlId = Branded<string, "EmergencyControlId">;
export type OverrideRequestId = Branded<string, "OverrideRequestId">;
export type GovernanceEnvironmentId = Branded<string, "GovernanceEnvironmentId">;
export type GovernanceDecisionId = Branded<string, "GovernanceDecisionId">;
export type GovernanceAuditLinkId = Branded<string, "GovernanceAuditLinkId">;
export type GovernanceCompatibilityViewId = Branded<string, "GovernanceCompatibilityViewId">;

export const createAdminFeatureFlagId = (value: string): AdminFeatureFlagId =>
  createPrefixedId(value, "agf_", "AdminFeatureFlagId") as AdminFeatureFlagId;
export const createGovernanceModuleId = (value: string): GovernanceModuleId =>
  createPrefixedId(value, "agm_", "GovernanceModuleId") as GovernanceModuleId;
export const createGovernanceSourceId = (value: string): GovernanceSourceId =>
  createPrefixedId(value, "ags_", "GovernanceSourceId") as GovernanceSourceId;
export const createGuardrailPolicyId = (value: string): GuardrailPolicyId =>
  createPrefixedId(value, "agr_", "GuardrailPolicyId") as GuardrailPolicyId;
export const createEmergencyControlId = (value: string): EmergencyControlId =>
  createPrefixedId(value, "age_", "EmergencyControlId") as EmergencyControlId;
export const createOverrideRequestId = (value: string): OverrideRequestId =>
  createPrefixedId(value, "ago_", "OverrideRequestId") as OverrideRequestId;
export const createGovernanceEnvironmentId = (value: string): GovernanceEnvironmentId =>
  createPrefixedId(value, "agev_", "GovernanceEnvironmentId") as GovernanceEnvironmentId;
export const createGovernanceDecisionId = (value: string): GovernanceDecisionId =>
  createPrefixedId(value, "agd_", "GovernanceDecisionId") as GovernanceDecisionId;
export const createGovernanceAuditLinkId = (value: string): GovernanceAuditLinkId =>
  createPrefixedId(value, "aga_", "GovernanceAuditLinkId") as GovernanceAuditLinkId;
export const createGovernanceCompatibilityViewId = (value: string): GovernanceCompatibilityViewId =>
  createPrefixedId(value, "agc_", "GovernanceCompatibilityViewId") as GovernanceCompatibilityViewId;
