import type { DependencyLink } from "../entities/dependency-link.entity.js";
import type { DependencyResolver, DependencyResolutionResult } from "../interfaces/dependency-resolver.js";
export declare class DeterministicDependencyResolver implements DependencyResolver {
    resolve(links: readonly DependencyLink[]): DependencyResolutionResult;
}
//# sourceMappingURL=deterministic-dependency-resolver.d.ts.map