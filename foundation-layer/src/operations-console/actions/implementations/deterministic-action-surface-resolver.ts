import type { ActionSurface } from "../entities/action-surface.entity.js";
import { createActionSurface } from "../entities/action-surface.entity.js";
import type { ActionSurfaceResolver, ResolveActionSurfaceInput } from "../interfaces/action-surface-resolver.js";
import { validateActionSurface } from "../../validators/validate-action-surface.js";

export class DeterministicActionSurfaceResolver implements ActionSurfaceResolver {
  resolve(input: ResolveActionSurfaceInput): ActionSurface {
    const report = validateActionSurface(input.surface);
    if (!report.isValid) {
      throw new Error(`Invalid ActionSurface: ${report.issues.map((issue) => issue.code).join(",")}`);
    }
    return createActionSurface(input.surface);
  }
}
