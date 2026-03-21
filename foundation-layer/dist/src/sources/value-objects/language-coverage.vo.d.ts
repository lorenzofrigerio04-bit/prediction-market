import { type LanguageCode } from "../../observations/value-objects/language-code.vo.js";
import { LanguageCoverageMode } from "../enums/language-coverage-mode.enum.js";
export type LanguageCoverage = Readonly<{
    mode: LanguageCoverageMode;
    languages: readonly LanguageCode[];
}>;
export declare const createLanguageCoverage: (input: {
    mode: LanguageCoverageMode;
    languages: readonly string[];
}) => LanguageCoverage;
//# sourceMappingURL=language-coverage.vo.d.ts.map