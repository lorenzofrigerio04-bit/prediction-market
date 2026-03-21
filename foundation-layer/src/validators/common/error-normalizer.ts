import type { ErrorObject } from "ajv";
import { ValidatorSeverity } from "../../enums/validator-severity.enum.js";
import type { ValidationIssue } from "../../entities/validation-report.entity.js";

const mapAjvKeywordToCode = (keyword: string): string => {
  switch (keyword) {
    case "required":
      return "REQUIRED_FIELD_MISSING";
    case "enum":
      return "INVALID_ENUM";
    case "format":
      return "INVALID_FORMAT";
    case "additionalProperties":
      return "ADDITIONAL_PROPERTY_NOT_ALLOWED";
    case "pattern":
      return "PATTERN_MISMATCH";
    case "minimum":
    case "maximum":
      return "OUT_OF_RANGE";
    default:
      return `SCHEMA_${keyword.toUpperCase()}`;
  }
};

export const normalizeAjvError = (error: ErrorObject): ValidationIssue => {
  const requiredProperty =
    error.keyword === "required"
      ? (error.params as { missingProperty?: string }).missingProperty ?? null
      : null;
  const path = requiredProperty
    ? `${error.instancePath}/${requiredProperty}`
    : error.instancePath || "/";

  return {
    code: mapAjvKeywordToCode(error.keyword),
    path,
    message: error.message ?? "Schema validation failure",
    severity: ValidatorSeverity.ERROR,
    context: {
      keyword: error.keyword,
      params: error.params,
      schemaPath: error.schemaPath,
    },
  };
};
