import type { ActionSurface } from "../entities/action-surface.entity.js";
export type ResolveActionSurfaceInput = Readonly<{
    surface: ActionSurface;
}>;
export interface ActionSurfaceResolver {
    resolve(input: ResolveActionSurfaceInput): ActionSurface;
}
//# sourceMappingURL=action-surface-resolver.d.ts.map