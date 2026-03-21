import { normalizeKey, normalizeWhitespace } from "../../common/utils/normalization.js";
const NEGATION_TOKENS = [" no ", " not ", " never ", " non ", " nessun ", " niente "];
const STOPWORDS = new Set([
    "the",
    "a",
    "an",
    "will",
    "be",
    "is",
    "are",
    "to",
    "of",
    "in",
    "by",
    "on",
    "for",
    "if",
    "se",
    "il",
    "la",
    "lo",
    "i",
    "gli",
    "le",
    "di",
    "e",
    "ed",
    "o",
]);
const tokenize = (value) => normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
const hasContradictoryNegation = (canonicalTitle, displayTitle) => {
    const canonical = ` ${normalizeKey(canonicalTitle)} `;
    const display = ` ${normalizeKey(displayTitle)} `;
    const canonicalNegation = NEGATION_TOKENS.some((token) => canonical.includes(token));
    const displayNegation = NEGATION_TOKENS.some((token) => display.includes(token));
    return canonicalNegation !== displayNegation;
};
export const isCanonicalMoreFormalThanDisplay = (canonicalTitle, displayTitle) => normalizeWhitespace(canonicalTitle).length >= normalizeWhitespace(displayTitle).length;
export const isDisplayTitleCompatible = (canonicalTitle, displayTitle) => {
    if (hasContradictoryNegation(canonicalTitle, displayTitle)) {
        return false;
    }
    const canonicalTokens = tokenize(canonicalTitle);
    const displayTokens = tokenize(displayTitle);
    const overlap = displayTokens.filter((token) => canonicalTokens.includes(token)).length;
    const overlapRatio = displayTokens.length === 0 ? 0 : overlap / displayTokens.length;
    const displayNumericTokens = new Set(displayTokens.filter((token) => /\d/.test(token)));
    const canonicalNumericTokens = new Set(canonicalTokens.filter((token) => /\d/.test(token)));
    const hasNewNumbers = [...displayNumericTokens].some((token) => !canonicalNumericTokens.has(token));
    return overlapRatio >= 0.6 && !hasNewNumbers;
};
//# sourceMappingURL=title-invariants.js.map