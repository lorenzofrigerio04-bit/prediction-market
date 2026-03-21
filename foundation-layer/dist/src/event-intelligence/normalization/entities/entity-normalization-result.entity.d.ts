import type { NormalizationMetadata } from "../../value-objects/shared-domain.vo.js";
import type { InterpretedEntity } from "../../interpretation/value-objects/interpreted-structures.vo.js";
export type EntityNormalizationResult = Readonly<{
    normalized_entities: readonly InterpretedEntity[];
    unresolved_entities: readonly InterpretedEntity[];
    normalization_confidence: number;
    normalization_metadata: NormalizationMetadata;
}>;
export declare const createEntityNormalizationResult: (input: EntityNormalizationResult) => EntityNormalizationResult;
//# sourceMappingURL=entity-normalization-result.entity.d.ts.map