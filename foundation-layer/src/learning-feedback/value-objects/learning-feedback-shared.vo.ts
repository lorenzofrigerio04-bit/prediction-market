import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type LearningRef = string;
export type LearningText = string;

export const createLearningRef = (value: string, fieldName: string): LearningRef => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_LEARNING_REFERENCE", `${fieldName} must not be empty`);
  }
  return normalized;
};

export const createLearningText = (value: string, fieldName: string): LearningText => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_LEARNING_TEXT", `${fieldName} must not be empty`);
  }
  return normalized;
};

export const createLearningRefList = (
  values: readonly string[],
  fieldName: string,
  minimum = 0,
): readonly LearningRef[] => {
  const normalized = values.map((value) => createLearningRef(value, fieldName));
  if (normalized.length < minimum) {
    throw new ValidationError(
      "INVALID_LEARNING_REFERENCE_LIST",
      `${fieldName} must contain at least ${minimum} item(s)`,
    );
  }
  if (new Set(normalized).size !== normalized.length) {
    throw new ValidationError("DUPLICATE_LEARNING_REFERENCE", `${fieldName} must be unique`);
  }
  return deepFreeze([...normalized]);
};

export const createLearningTextList = (
  values: readonly string[],
  fieldName: string,
  minimum = 0,
): readonly LearningText[] => {
  const normalized = values.map((value) => createLearningText(value, fieldName));
  if (normalized.length < minimum) {
    throw new ValidationError(
      "INVALID_LEARNING_TEXT_LIST",
      `${fieldName} must contain at least ${minimum} item(s)`,
    );
  }
  return deepFreeze([...normalized]);
};
