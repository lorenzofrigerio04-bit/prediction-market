import { type EdgeCaseRenderer } from "../../rendering/interfaces/edge-case-renderer.js";
import { type SourcePolicyRenderer } from "../../rendering/interfaces/source-policy-renderer.js";
import { type TimePolicyRenderer } from "../../rendering/interfaces/time-policy-renderer.js";
import { type RulebookCompilation } from "../entities/rulebook-compilation.entity.js";
import type { RulebookCompiler, RulebookCompilerInput } from "../interfaces/rulebook-compiler.js";
export declare class DeterministicRulebookCompiler implements RulebookCompiler {
    private readonly timePolicyRenderer;
    private readonly sourcePolicyRenderer;
    private readonly edgeCaseRenderer;
    constructor(timePolicyRenderer: TimePolicyRenderer, sourcePolicyRenderer: SourcePolicyRenderer, edgeCaseRenderer: EdgeCaseRenderer);
    compile(input: RulebookCompilerInput): RulebookCompilation;
}
//# sourceMappingURL=deterministic-rulebook-compiler.d.ts.map