import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { createLanguageCode, type LanguageCode } from "../../observations/value-objects/language-code.vo.js";
import { LanguageCoverageMode } from "../enums/language-coverage-mode.enum.js";

export type LanguageCoverage = Readonly<{
  mode: LanguageCoverageMode;
  languages: readonly LanguageCode[];
}>;

export const createLanguageCoverage = (input: {
  mode: LanguageCoverageMode;
  languages: readonly string[];
}): LanguageCoverage => {
  if (input.mode === LanguageCoverageMode.EXPLICIT_LIST && input.languages.length === 0) {
    throw new ValidationError(
      "INVALID_LANGUAGE_COVERAGE",
      "languages must be non-empty when mode is EXPLICIT_LIST",
    );
  }
  const parsedLanguages = input.languages.map((language) => createLanguageCode(language));
  return deepFreeze({
    mode: input.mode,
    languages: parsedLanguages,
  });
};
