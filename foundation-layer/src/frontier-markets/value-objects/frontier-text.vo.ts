import { ValidationError } from "../../common/errors/validation-error.js";
import type { Branded } from "../../common/types/branded.js";

export type DisplayLabel = Branded<string, "DisplayLabel">;
export type SemanticDefinition = Branded<string, "SemanticDefinition">;
export type ValidationNote = Branded<string, "ValidationNote">;
export type CompatibilityNote = Branded<string, "CompatibilityNote">;
export type TriggerPolicyNote = Branded<string, "TriggerPolicyNote">;

const assertNonEmptyTrimmed = (value: string, code: string, field: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError(code, `${field} must be non-empty`);
  }
  return trimmed;
};

export const createDisplayLabel = (value: string): DisplayLabel =>
  assertNonEmptyTrimmed(value, "INVALID_DISPLAY_LABEL", "display_label") as DisplayLabel;

export const createSemanticDefinition = (value: string): SemanticDefinition =>
  assertNonEmptyTrimmed(value, "INVALID_SEMANTIC_DEFINITION", "semantic_definition") as SemanticDefinition;

export const createValidationNote = (value: string): ValidationNote =>
  assertNonEmptyTrimmed(value, "INVALID_VALIDATION_NOTE", "validation_note") as ValidationNote;

export const createCompatibilityNote = (value: string): CompatibilityNote =>
  assertNonEmptyTrimmed(value, "INVALID_COMPATIBILITY_NOTE", "compatibility_note") as CompatibilityNote;

export const createTriggerPolicyNote = (value: string): TriggerPolicyNote =>
  assertNonEmptyTrimmed(value, "INVALID_TRIGGER_POLICY_NOTE", "trigger_policy_note") as TriggerPolicyNote;
