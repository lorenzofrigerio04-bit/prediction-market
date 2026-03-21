import { PlatformAccessAdminGovernanceCompatibilityAdapter } from "./platform-access-admin-governance-compatibility.adapter.js";
export class OperationsConsoleAdminGovernanceCompatibilityAdapter {
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
//# sourceMappingURL=operations-console-admin-governance-compatibility.adapter.js.map