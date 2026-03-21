import { createConsoleNavigationState } from "../entities/console-navigation-state.entity.js";
import { validateConsoleNavigationState } from "../../validators/validate-console-navigation-state.js";
export class DeterministicConsoleStateResolver {
    resolve(input) {
        const report = validateConsoleNavigationState(input.state);
        if (!report.isValid) {
            throw new Error(`Invalid ConsoleNavigationState: ${report.issues.map((issue) => issue.code).join(",")}`);
        }
        return createConsoleNavigationState(input.state);
    }
}
//# sourceMappingURL=deterministic-console-state-resolver.js.map