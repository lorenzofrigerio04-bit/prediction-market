import { DependencyStrength } from "../../enums/dependency-strength.enum.js";
export class DeterministicDependencyResolver {
    resolve(links) {
        const blocking_issues = [];
        for (const link of links) {
            if (link.blocking && link.dependency_strength === DependencyStrength.WEAK) {
                blocking_issues.push(`blocking dependency ${link.id} cannot have dependency_strength=weak`);
            }
        }
        return {
            links: [...links],
            blocking_issues,
        };
    }
}
//# sourceMappingURL=deterministic-dependency-resolver.js.map