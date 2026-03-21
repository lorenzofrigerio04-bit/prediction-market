import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { normalizeKey, normalizeWhitespace } from "../../../common/utils/normalization.js";
import { TitleGenerationStatus } from "../../enums/title-generation-status.enum.js";
import { createDeterministicMetadata, createTextBlock, } from "../../value-objects/publishing-shared.vo.js";
import { isCanonicalMoreFormalThanDisplay, isDisplayTitleCompatible, } from "../title-invariants.js";
const tokenize = (value) => normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0);
const validateDisplayCompatibility = (canonicalTitle, displayTitle) => {
    if (!isDisplayTitleCompatible(canonicalTitle, displayTitle)) {
        throw new ValidationError("DISPLAY_TITLE_NOT_COMPATIBLE", "display_title must be a presentational variant of canonical_title");
    }
};
const validateCanonicalMoreFormal = (canonicalTitle, displayTitle) => {
    if (!isCanonicalMoreFormalThanDisplay(canonicalTitle, displayTitle)) {
        throw new ValidationError("CANONICAL_TITLE_NOT_FORMAL_ENOUGH", "canonical_title must be at least as formal as display_title");
    }
};
const validateSubtitle = (canonicalTitle, displayTitle, subtitle) => {
    if (subtitle === null) {
        return null;
    }
    const normalized = createTextBlock(subtitle, "subtitle");
    const lowered = ` ${normalizeKey(normalized)} `;
    const forbiddenPatterns = [" if and only if ", " provided that ", " unless ", " only if ", " salvo "];
    if (forbiddenPatterns.some((pattern) => lowered.includes(pattern))) {
        throw new ValidationError("SUBTITLE_INTRODUCES_CONDITIONS", "subtitle must not introduce new contractual conditions");
    }
    const baseTokens = new Set([...tokenize(canonicalTitle), ...tokenize(displayTitle)]);
    const numericSubtitleTokens = tokenize(normalized).filter((token) => /\d/.test(token));
    const hasNewNumericClaim = numericSubtitleTokens.some((token) => !baseTokens.has(token));
    if (hasNewNumericClaim) {
        throw new ValidationError("SUBTITLE_INTRODUCES_CONDITIONS", "subtitle must not add numeric contractual constraints not present upstream");
    }
    return normalized;
};
export const createTitleSet = (input) => {
    if (!Object.values(TitleGenerationStatus).includes(input.title_generation_status)) {
        throw new ValidationError("INVALID_TITLE_SET", "title_generation_status is invalid");
    }
    const canonicalTitle = createTextBlock(input.canonical_title, "canonical_title");
    const displayTitle = createTextBlock(input.display_title, "display_title");
    validateCanonicalMoreFormal(canonicalTitle, displayTitle);
    validateDisplayCompatibility(canonicalTitle, displayTitle);
    const subtitle = validateSubtitle(canonicalTitle, displayTitle, input.subtitle);
    return deepFreeze({
        ...input,
        canonical_title: canonicalTitle,
        display_title: displayTitle,
        subtitle,
        generation_metadata: createDeterministicMetadata(input.generation_metadata, "generation_metadata"),
    });
};
//# sourceMappingURL=title-set.entity.js.map