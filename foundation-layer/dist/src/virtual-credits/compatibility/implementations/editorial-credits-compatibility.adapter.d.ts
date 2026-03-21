import type { CreditsCompatibilityView } from "../entities/credits-compatibility-view.entity.js";
import type { CreditsCompatibilityAdapter, CreditsCompatibilityContext } from "../interfaces/credits-compatibility-adapter.js";
export declare class EditorialCreditsCompatibilityAdapter implements CreditsCompatibilityAdapter {
    buildOperationsConsoleUsageView(context: CreditsCompatibilityContext): CreditsCompatibilityView;
    buildAccessScopedCreditView(context: CreditsCompatibilityContext): CreditsCompatibilityView;
    buildEditorialUsageGuardView(context: CreditsCompatibilityContext): CreditsCompatibilityView;
    validateCompatibility(view: CreditsCompatibilityView, context?: CreditsCompatibilityContext): boolean;
}
//# sourceMappingURL=editorial-credits-compatibility.adapter.d.ts.map