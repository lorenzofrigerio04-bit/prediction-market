import type {
  AdminGovernanceCompatibilityAdapter,
  AdminGovernanceCompatibilityContext,
} from "../interfaces/admin-governance-compatibility-adapter.js";
import type { AdminGovernanceCompatibilityView } from "../entities/admin-governance-compatibility-view.entity.js";
import { PlatformAccessAdminGovernanceCompatibilityAdapter } from "./platform-access-admin-governance-compatibility.adapter.js";

export class OperationsConsoleAdminGovernanceCompatibilityAdapter implements AdminGovernanceCompatibilityAdapter {
  private readonly delegate = new PlatformAccessAdminGovernanceCompatibilityAdapter();

  buildPlatformAccessView(context: AdminGovernanceCompatibilityContext): AdminGovernanceCompatibilityView {
    return this.delegate.buildPlatformAccessView(context);
  }

  buildOperationsConsoleView(context: AdminGovernanceCompatibilityContext): AdminGovernanceCompatibilityView {
    return this.delegate.buildOperationsConsoleView(context);
  }

  buildVirtualCreditsView(context: AdminGovernanceCompatibilityContext): AdminGovernanceCompatibilityView {
    return this.delegate.buildVirtualCreditsView(context);
  }

  validateCompatibility(view: AdminGovernanceCompatibilityView, context?: AdminGovernanceCompatibilityContext): boolean {
    return this.delegate.validateCompatibility(view, context);
  }
}
