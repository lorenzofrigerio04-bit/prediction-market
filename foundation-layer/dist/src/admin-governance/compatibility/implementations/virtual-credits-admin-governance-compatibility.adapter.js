import { PlatformAccessAdminGovernanceCompatibilityAdapter } from "./platform-access-admin-governance-compatibility.adapter.js";
export class VirtualCreditsAdminGovernanceCompatibilityAdapter {
    delegate = new PlatformAccessAdminGovernanceCompatibilityAdapter();
    buildPlatformAccessView(context) {
        return this.delegate.buildPlatformAccessView(context);
    }
    buildOperationsConsoleView(context) {
        return this.delegate.buildOperationsConsoleView(context);
    }
    buildVirtualCreditsView(context) {
        return this.delegate.buildVirtualCreditsView(context);
    }
    validateCompatibility(view, context) {
        return this.delegate.validateCompatibility(view, context);
    }
}
//# sourceMappingURL=virtual-credits-admin-governance-compatibility.adapter.js.map