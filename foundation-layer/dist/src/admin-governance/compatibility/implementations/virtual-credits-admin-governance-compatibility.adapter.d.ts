import type { AdminGovernanceCompatibilityAdapter, AdminGovernanceCompatibilityContext } from "../interfaces/admin-governance-compatibility-adapter.js";
import type { AdminGovernanceCompatibilityView } from "../entities/admin-governance-compatibility-view.entity.js";
export declare class VirtualCreditsAdminGovernanceCompatibilityAdapter implements AdminGovernanceCompatibilityAdapter {
    private readonly delegate;
    buildPlatformAccessView(context: AdminGovernanceCompatibilityContext): AdminGovernanceCompatibilityView;
    buildOperationsConsoleView(context: AdminGovernanceCompatibilityContext): AdminGovernanceCompatibilityView;
    buildVirtualCreditsView(context: AdminGovernanceCompatibilityContext): AdminGovernanceCompatibilityView;
    validateCompatibility(view: AdminGovernanceCompatibilityView, context?: AdminGovernanceCompatibilityContext): boolean;
}
//# sourceMappingURL=virtual-credits-admin-governance-compatibility.adapter.d.ts.map