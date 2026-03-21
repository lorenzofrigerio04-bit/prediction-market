import type { InterpretedEntity } from "../../interpretation/value-objects/interpreted-structures.vo.js";
import type { EntityNormalizationResult } from "../entities/entity-normalization-result.entity.js";
export interface EntityNormalizer {
    normalize(entities: readonly InterpretedEntity[]): EntityNormalizationResult;
}
//# sourceMappingURL=entity-normalizer.d.ts.map