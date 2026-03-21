import { createActionSurface } from "../entities/action-surface.entity.js";
import { validateActionSurface } from "../../validators/validate-action-surface.js";
export class DeterministicActionSurfaceResolver {
    resolve(input) {
        const report = validateActionSurface(input.surface);
        if (!report.isValid) {
            throw new Error(`Invalid ActionSurface: ${report.issues.map((issue) => issue.code).join(",")}`);
        }
        return createActionSurface(input.surface);
    }
}
//# sourceMappingURL=deterministic-action-surface-resolver.js.map