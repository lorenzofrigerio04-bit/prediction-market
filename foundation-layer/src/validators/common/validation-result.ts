import type { ValidateFunction } from "ajv";
import {
  createValidationReport,
  type ValidationIssue,
  type ValidationReport,
} from "../../entities/validation-report.entity.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { type Timestamp, createTimestamp } from "../../value-objects/timestamp.vo.js";
import { normalizeAjvError } from "./error-normalizer.js";
import { ajv } from "../ajv/ajv-instance.js";

export type ValidationOptions = Readonly<{
  generatedAt?: Timestamp;
}>;

const DEFAULT_GENERATED_AT = createTimestamp("1970-01-01T00:00:00.000Z");

export const buildValidationReport = (
  targetType: string,
  targetId: string,
  issues: readonly ValidationIssue[],
  generatedAt: Timestamp,
): ValidationReport =>
  createValidationReport({
    targetType,
    targetId,
    isValid: issues.length === 0,
    issues,
    generatedAt,
  });

export const resolveGeneratedAt = (options?: ValidationOptions): Timestamp =>
  options?.generatedAt ?? DEFAULT_GENERATED_AT;

export const requireSchemaValidator = (schemaId: string): ValidateFunction => {
  const schemaValidator = ajv.getSchema(schemaId);
  if (schemaValidator === undefined) {
    throw new ValidationError(
      "SCHEMA_NOT_REGISTERED",
      `Schema not registered in Ajv: ${schemaId}`,
      { schemaId },
    );
  }
  return schemaValidator;
};

export const validateBySchema = (
  validateFn: ValidateFunction,
  payload: unknown,
): readonly ValidationIssue[] => {
  const valid = validateFn(payload);
  if (valid) {
    return [];
  }
  return (validateFn.errors ?? []).map(normalizeAjvError);
};
