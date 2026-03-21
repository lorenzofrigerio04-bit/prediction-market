import type { CreditsCompatibilityView } from "../entities/credits-compatibility-view.entity.js";
import type { CreditsCompatibilityAdapter, CreditsCompatibilityContext } from "../interfaces/credits-compatibility-adapter.js";
export declare class PlatformAccessCreditsCompatibilityAdapter implements CreditsCompatibilityAdapter {
    buildOperationsConsoleUsageView(context: CreditsCompatibilityContext): CreditsCompatibilityView;
    buildAccessScopedCreditView(context: CreditsCompatibilityContext): CreditsCompatibilityView;
    buildEditorialUsageGuardView(context: CreditsCompatibilityContext): CreditsCompatibilityView;
    validateCompatibility(view: CreditsCompatibilityView, context?: CreditsCompatibilityContext): boolean;
}
//# sourceMappingURL=platform-access-credits-compatibility.adapter.d.ts.map