import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { SourceUseCase } from "../enums/source-use-case.enum.js";
export const createSourceCapability = (input) => deepFreeze({
    supportsDiscovery: input.supportsDiscovery,
    supportsValidation: input.supportsValidation,
    supportsResolution: input.supportsResolution,
    supportsAttentionScoring: input.supportsAttentionScoring,
});
export const deriveSourceCapabilityFromUseCases = (supportedUseCases) => createSourceCapability({
    supportsDiscovery: supportedUseCases.includes(SourceUseCase.DISCOVERY),
    supportsValidation: supportedUseCases.includes(SourceUseCase.VALIDATION),
    supportsResolution: supportedUseCases.includes(SourceUseCase.RESOLUTION),
    supportsAttentionScoring: supportedUseCases.includes(SourceUseCase.ATTENTION),
});
//# sourceMappingURL=source-capability.vo.js.map