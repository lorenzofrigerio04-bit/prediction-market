import { discoveryErrorReportSchema } from "./discovery-error-report.schema.js";
import { discoveryJobDefinitionSchema } from "./discovery-job-definition.schema.js";
import { discoveryProvenanceMetadataSchema } from "./discovery-provenance-metadata.schema.js";
import { discoveryRunDefinitionSchema } from "./discovery-run-definition.schema.js";
import { discoverySignalSchema } from "./discovery-signal.schema.js";
import { discoverySourceCatalogEntrySchema } from "./discovery-source-catalog-entry.schema.js";
import { discoverySourceDefinitionSchema } from "./discovery-source-definition.schema.js";
import { discoveryValidationFailureSchema } from "./discovery-validation-failure.schema.js";
import { normalizedDiscoveryItemSchema } from "./normalized-discovery-item.schema.js";
import { normalizedDiscoveryPayloadSchema } from "./normalized-discovery-payload.schema.js";
export const discoveryNewsEngineSchemas = [
    discoveryProvenanceMetadataSchema,
    normalizedDiscoveryItemSchema,
    normalizedDiscoveryPayloadSchema,
    discoverySourceDefinitionSchema,
    discoverySourceCatalogEntrySchema,
    discoveryValidationFailureSchema,
    discoveryErrorReportSchema,
    discoveryRunDefinitionSchema,
    discoveryJobDefinitionSchema,
    discoverySignalSchema,
];
export { DISCOVERY_ERROR_REPORT_SCHEMA_ID } from "./discovery-error-report.schema.js";
export { DISCOVERY_JOB_DEFINITION_SCHEMA_ID } from "./discovery-job-definition.schema.js";
export { DISCOVERY_PROVENANCE_METADATA_SCHEMA_ID } from "./discovery-provenance-metadata.schema.js";
export { DISCOVERY_RUN_DEFINITION_SCHEMA_ID } from "./discovery-run-definition.schema.js";
export { DISCOVERY_SIGNAL_SCHEMA_ID } from "./discovery-signal.schema.js";
export { DISCOVERY_SOURCE_CATALOG_ENTRY_SCHEMA_ID } from "./discovery-source-catalog-entry.schema.js";
export { DISCOVERY_SOURCE_DEFINITION_SCHEMA_ID } from "./discovery-source-definition.schema.js";
export { DISCOVERY_VALIDATION_FAILURE_SCHEMA_ID } from "./discovery-validation-failure.schema.js";
export { NORMALIZED_DISCOVERY_ITEM_SCHEMA_ID } from "./normalized-discovery-item.schema.js";
export { NORMALIZED_DISCOVERY_PAYLOAD_SCHEMA_ID } from "./normalized-discovery-payload.schema.js";
//# sourceMappingURL=index.js.map