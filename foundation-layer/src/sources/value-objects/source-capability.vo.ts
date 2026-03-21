import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { SourceUseCase } from "../enums/source-use-case.enum.js";

export type SourceCapability = Readonly<{
  supportsDiscovery: boolean;
  supportsValidation: boolean;
  supportsResolution: boolean;
  supportsAttentionScoring: boolean;
}>;

export const createSourceCapability = (input: SourceCapability): SourceCapability =>
  deepFreeze({
    supportsDiscovery: input.supportsDiscovery,
    supportsValidation: input.supportsValidation,
    supportsResolution: input.supportsResolution,
    supportsAttentionScoring: input.supportsAttentionScoring,
  });

export const deriveSourceCapabilityFromUseCases = (
  supportedUseCases: readonly SourceUseCase[],
): SourceCapability =>
  createSourceCapability({
    supportsDiscovery: supportedUseCases.includes(SourceUseCase.DISCOVERY),
    supportsValidation: supportedUseCases.includes(SourceUseCase.VALIDATION),
    supportsResolution: supportedUseCases.includes(SourceUseCase.RESOLUTION),
    supportsAttentionScoring: supportedUseCases.includes(SourceUseCase.ATTENTION),
  });
