import {
  errorIssue,
  type ValidationIssue,
  type ValidationReport,
} from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { DISCOVERY_SOURCE_CATALOG_ENTRY_SCHEMA_ID } from "../schemas/discovery-source-catalog-entry.schema.js";
import type { DiscoverySourceCatalogEntry } from "../entities/discovery-source-catalog-entry.entity.js";
import { catalogEntryToSourceDefinition } from "../entities/discovery-source-catalog-entry.entity.js";
import { validateDiscoverySourceDefinition } from "./validate-discovery-source-definition.js";

const validateDiscoverySourceCatalogEntryInvariants = (
  input: DiscoverySourceCatalogEntry,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.name.trim().length === 0) {
    issues.push(
      errorIssue(
        "INVALID_DISCOVERY_SOURCE_CATALOG_ENTRY",
        "/name",
        "name must be non-empty",
      ),
    );
  }
  if (input.endpoint.url.trim().length === 0) {
    issues.push(
      errorIssue(
        "INVALID_DISCOVERY_SOURCE_CATALOG_ENTRY",
        "/endpoint/url",
        "endpoint url must be non-empty",
      ),
    );
  }
  if (input.descriptionNullable !== null && input.descriptionNullable.trim().length === 0) {
    issues.push(
      errorIssue(
        "INVALID_DISCOVERY_SOURCE_CATALOG_ENTRY",
        "/descriptionNullable",
        "descriptionNullable cannot be empty when provided",
      ),
    );
  }
  return issues;
};

export const validateDiscoverySourceCatalogEntry = (
  input: DiscoverySourceCatalogEntry,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(DISCOVERY_SOURCE_CATALOG_ENTRY_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateDiscoverySourceCatalogEntryInvariants(input);
  const definitionReport = validateDiscoverySourceDefinition(
    catalogEntryToSourceDefinition(input),
    options,
  );
  const definitionIssues = definitionReport.issues.map((i) => ({
    ...i,
    path: `/definition${i.path}`,
  }));
  const issues = [
    ...schemaIssues,
    ...invariantIssues,
    ...definitionIssues,
  ];
  return buildValidationReport(
    "DiscoverySourceCatalogEntry",
    input.key,
    issues,
    resolveGeneratedAt(options),
  );
};
