import type { DependencyLink } from "../entities/dependency-link.entity.js";

export type DependencyResolutionResult = Readonly<{
  links: readonly DependencyLink[];
  blocking_issues: readonly string[];
}>;

export interface DependencyResolver {
  resolve(links: readonly DependencyLink[]): DependencyResolutionResult;
}
