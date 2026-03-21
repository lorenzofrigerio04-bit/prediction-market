import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export const FINDING_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

export type SeveritySummary = Readonly<{
  low: number;
  medium: number;
  high: number;
  critical: number;
  highest_severity: FindingSeverity;
  total_findings: number;
}>;

const highestFromSummary = (input: Omit<SeveritySummary, "highest_severity" | "total_findings">): FindingSeverity => {
  if (input.critical > 0) {
    return "critical";
  }
  if (input.high > 0) {
    return "high";
  }
  if (input.medium > 0) {
    return "medium";
  }
  return "low";
};

export const createSeveritySummary = (input: {
  low: number;
  medium: number;
  high: number;
  critical: number;
}): SeveritySummary => {
  const values = [input.low, input.medium, input.high, input.critical];
  if (values.some((value) => !Number.isInteger(value) || value < 0)) {
    throw new ValidationError(
      "INVALID_SEVERITY_SUMMARY",
      "severity counts must be non-negative integers",
    );
  }
  const total = input.low + input.medium + input.high + input.critical;
  return deepFreeze({
    ...input,
    total_findings: total,
    highest_severity: highestFromSummary(input),
  });
};
