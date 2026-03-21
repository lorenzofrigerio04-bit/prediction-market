import { PackageStatus } from "../enums/package-status.enum.js";
import { ArtifactType } from "../enums/artifact-type.enum.js";
import { MarketVisibility } from "../enums/market-visibility.enum.js";
import { ComplianceFlag } from "../enums/compliance-flag.enum.js";
export declare const PUBLICATION_PACKAGE_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/publication-package.schema.json";
export declare const publicationPackageSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-package.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publication_ready_artifact_id", "packaged_artifacts", "package_metadata", "package_status", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$";
        };
        readonly publication_ready_artifact_id: {
            readonly type: "string";
            readonly pattern: "^prad_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly packaged_artifacts: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["artifact_type", "artifact_ref", "integrity_hash", "required"];
                readonly properties: {
                    readonly artifact_type: {
                        readonly type: "string";
                        readonly enum: ArtifactType[];
                    };
                    readonly artifact_ref: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly integrity_hash: {
                        readonly type: "string";
                        readonly pattern: "^([a-fA-F0-9]{64}|sha256:[a-fA-F0-9]{64})$";
                    };
                    readonly required: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly package_metadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["category", "tags", "jurisdiction", "display_priority", "market_visibility", "compliance_flags"];
            readonly properties: {
                readonly category: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly tags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly jurisdiction: {
                    readonly type: "string";
                    readonly pattern: "^[A-Z]{2,3}$";
                };
                readonly display_priority: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly market_visibility: {
                    readonly type: "string";
                    readonly enum: MarketVisibility[];
                };
                readonly compliance_flags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: ComplianceFlag[];
                    };
                };
            };
        };
        readonly package_status: {
            readonly type: "string";
            readonly enum: PackageStatus[];
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
};
//# sourceMappingURL=publication-package.schema.d.ts.map