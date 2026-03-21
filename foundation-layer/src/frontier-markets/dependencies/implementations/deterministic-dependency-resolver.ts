import { DependencyStrength } from "../../enums/dependency-strength.enum.js";
import type { DependencyLink } from "../entities/dependency-link.entity.js";
import type { DependencyResolver, DependencyResolutionResult } from "../interfaces/dependency-resolver.js";

export class DeterministicDependencyResolver implements DependencyResolver {
  resolve(links: readonly DependencyLink[]): DependencyResolutionResult {
    const blocking_issues: string[] = [];
    for (const link of links) {
      if (link.blocking && link.dependency_strength === DependencyStrength.WEAK) {
        blocking_issues.push(
          `blocking dependency ${link.id} cannot have dependency_strength=weak`,
        );
      }
    }
    return {
      links: [...links],
      blocking_issues,
    };
  }
}
