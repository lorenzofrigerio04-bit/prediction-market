import type { EntityVersion } from "../../value-objects/entity-version.vo.js";
import { AuthorityLevel } from "../enums/authority-level.enum.js";
import { EnablementStatus } from "../enums/enablement-status.enum.js";
import { ParseStrategy } from "../enums/parse-strategy.enum.js";
import { SourceClass } from "../enums/source-class.enum.js";
import { SourceUseCase } from "../enums/source-use-case.enum.js";
import type { FreshnessProfile } from "../value-objects/freshness-profile.vo.js";
import type { LanguageCoverage } from "../value-objects/language-coverage.vo.js";
import type { ReliabilityProfile } from "../value-objects/reliability-profile.vo.js";
import type { SourceBaseIdentifier } from "../value-objects/source-base-identifier.vo.js";
import type { SourceCapability } from "../value-objects/source-capability.vo.js";
import type { SourceDefinitionId } from "../value-objects/source-definition-id.vo.js";
export type SourceDefinition = Readonly<{
    id: SourceDefinitionId;
    version: EntityVersion;
    displayName: string;
    sourceClass: SourceClass;
    baseIdentifier: SourceBaseIdentifier;
    supportedUseCases: readonly SourceUseCase[];
    capability: SourceCapability;
    authorityLevel: AuthorityLevel;
    reliabilityProfile: ReliabilityProfile;
    freshnessProfile: FreshnessProfile;
    languageCoverage: LanguageCoverage;
    parseStrategy: ParseStrategy;
    enablementStatus: EnablementStatus;
}>;
type SourceDefinitionInput = Omit<SourceDefinition, "displayName" | "capability"> & {
    displayName: string;
};
export declare const createSourceDefinition: (input: SourceDefinitionInput) => SourceDefinition;
export {};
//# sourceMappingURL=source-definition.entity.d.ts.map