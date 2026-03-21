import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import { ThresholdStatus } from "../enums/threshold-status.enum.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { ModuleHealthMetric } from "../metrics/entities/module-health-metric.entity.js";
import { MODULE_HEALTH_METRIC_SCHEMA_ID } from "../schemas/module-health-metric.schema.js";

const expectedStatusFromThreshold = (input: ModuleHealthMetric): ThresholdStatus | null => {
  const metadata = input.threshold_metadata_nullable;
  if (metadata === null || metadata.threshold_min_nullable === null) {
    return null;
  }
  if (input.metric_value < metadata.threshold_min_nullable) {
    return ThresholdStatus.BREACHED;
  }
  if (metadata.threshold_target_nullable !== null && input.metric_value < metadata.threshold_target_nullable) {
    return ThresholdStatus.WARNING;
  }
  return ThresholdStatus.HEALTHY;
};

const validateModuleHealthMetricInvariants = (input: ModuleHealthMetric): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const expectedStatus = expectedStatusFromThreshold(input);
  if (expectedStatus !== null && input.threshold_status !== expectedStatus) {
    issues.push(
      errorIssue(
        "THRESHOLD_STATUS_MISMATCH",
        "/threshold_status",
        "ModuleHealthMetric.thresholdStatus must be coherent with metricValue and threshold metadata",
      ),
    );
  }
  return issues;
};

export const validateModuleHealthMetric = (
  input: ModuleHealthMetric,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(MODULE_HEALTH_METRIC_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateModuleHealthMetricInvariants(input);
  return buildValidationReport(
    "ModuleHealthMetric",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
