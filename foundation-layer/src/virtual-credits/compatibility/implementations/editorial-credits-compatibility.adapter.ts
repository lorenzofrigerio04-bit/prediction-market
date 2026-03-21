import { ConsistencyStatus } from "../../enums/consistency-status.enum.js";
import { createCreditsCompatibilityView } from "../entities/credits-compatibility-view.entity.js";
import type { CreditsCompatibilityView } from "../entities/credits-compatibility-view.entity.js";
import type {
  CreditsCompatibilityAdapter,
  CreditsCompatibilityContext,
} from "../interfaces/credits-compatibility-adapter.js";
import { validateCreditsCompatibility } from "../validators/validate-credits-compatibility.js";

export class EditorialCreditsCompatibilityAdapter implements CreditsCompatibilityAdapter {
  buildOperationsConsoleUsageView(context: CreditsCompatibilityContext): CreditsCompatibilityView {
    return this.buildEditorialUsageGuardView(context);
  }

  buildAccessScopedCreditView(context: CreditsCompatibilityContext): CreditsCompatibilityView {
    return this.buildEditorialUsageGuardView(context);
  }

  buildEditorialUsageGuardView(context: CreditsCompatibilityContext): CreditsCompatibilityView {
    return createCreditsCompatibilityView({
      id: context.access_scope_ref,
      owner_ref: context.owner_ref,
      access_scope_ref: context.access_scope_ref,
      account_ref_nullable: context.account_ref_nullable,
      visible_balance_nullable: null,
      active_quota_refs: context.active_quota_refs,
      active_risk_flags: context.active_risk_flags,
      allowed_actions: context.allowed_actions.filter((action) => action.startsWith("editorial.")),
      warnings: context.warnings,
      compatibility_status: ConsistencyStatus.PARTIAL,
    });
  }

  validateCompatibility(view: CreditsCompatibilityView, context?: CreditsCompatibilityContext): boolean {
    return validateCreditsCompatibility(view, undefined, context).isValid;
  }
}
