import { SourceUseCase } from "../enums/source-use-case.enum.js";
export type SourceCapability = Readonly<{
    supportsDiscovery: boolean;
    supportsValidation: boolean;
    supportsResolution: boolean;
    supportsAttentionScoring: boolean;
}>;
export declare const createSourceCapability: (input: SourceCapability) => SourceCapability;
export declare const deriveSourceCapabilityFromUseCases: (supportedUseCases: readonly SourceUseCase[]) => SourceCapability;
//# sourceMappingURL=source-capability.vo.d.ts.map