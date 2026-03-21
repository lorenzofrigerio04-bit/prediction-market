import { deepFreeze } from "../common/utils/deep-freeze.js";
import { stableSort } from "../common/utils/stable-sort.js";
import { ValidatorSeverity } from "../enums/validator-severity.enum.js";
import type { Timestamp } from "../value-objects/timestamp.vo.js";

export type ValidationIssue = Readonly<{
  code: string;
  path: string;
  message: string;
  severity: ValidatorSeverity;
  context?: Record<string, unknown>;
}>;

export type ValidationReport = Readonly<{
  targetType: string;
  targetId: string;
  isValid: boolean;
  issues: readonly ValidationIssue[];
  generatedAt: Timestamp;
}>;

export const sortValidationIssues = (
  issues: readonly ValidationIssue[],
): readonly ValidationIssue[] =>
  stableSort(issues, (left, right) => {
    const pathDiff = left.path.localeCompare(right.path);
    if (pathDiff !== 0) {
      return pathDiff;
    }
    const codeDiff = left.code.localeCompare(right.code);
    if (codeDiff !== 0) {
      return codeDiff;
    }
    return left.message.localeCompare(right.message);
  });

export const createValidationReport = (input: ValidationReport): ValidationReport => {
  const sortedIssues = sortValidationIssues(input.issues);
  const isValid = sortedIssues.length === 0;
  return deepFreeze({
    ...input,
    isValid,
    issues: sortedIssues,
  });
};

export const errorIssue = (
  code: string,
  path: string,
  message: string,
  context?: Record<string, unknown>,
): ValidationIssue => {
  const base = {
    code,
    path,
    message,
    severity: ValidatorSeverity.ERROR,
  };
  if (context === undefined) {
    return deepFreeze(base);
  }
  return deepFreeze({
    ...base,
    context,
  });
};
