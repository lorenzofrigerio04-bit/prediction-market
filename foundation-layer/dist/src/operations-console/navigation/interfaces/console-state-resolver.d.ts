import type { ConsoleNavigationState } from "../entities/console-navigation-state.entity.js";
export type ResolveConsoleStateInput = Readonly<{
    state: ConsoleNavigationState;
}>;
export interface ConsoleStateResolver {
    resolve(input: ResolveConsoleStateInput): ConsoleNavigationState;
}
//# sourceMappingURL=console-state-resolver.d.ts.map