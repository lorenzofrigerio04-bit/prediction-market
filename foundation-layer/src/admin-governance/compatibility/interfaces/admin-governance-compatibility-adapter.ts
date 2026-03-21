import type { AdminGovernanceCompatibilityView } from "../entities/admin-governance-compatibility-view.entity.js";
import type { Metadata, ModuleKey, OperationKey } from "../../value-objects/index.js";

export type AdminGovernanceCompatibilityContext = Readonly<{
  module_key: ModuleKey;
  requested_operations: readonly OperationKey[];
  denied_operations: readonly OperationKey[];
  lossy_fields: readonly string[];
  metadata: Metadata;
}>;

export interface AdminGovernanceCompatibilityAdapter {
  buildPlatformAccessView(context: AdminGovernanceCompatibilityContext): AdminGovernanceCompatibilityView;
  buildOperationsConsoleView(context: AdminGovernanceCompatibilityContext): AdminGovernanceCompatibilityView;
  buildVirtualCreditsView(context: AdminGovernanceCompatibilityContext): AdminGovernanceCompatibilityView;
  validateCompatibility(view: AdminGovernanceCompatibilityView, context?: AdminGovernanceCompatibilityContext): boolean;
}
