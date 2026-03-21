import { ActivationPolicy } from "../enums/activation-policy.enum.js";
import { ContractStatus } from "../enums/contract-status.enum.js";
import { ComplianceFlag } from "../enums/compliance-flag.enum.js";
import { MarketVisibility } from "../enums/market-visibility.enum.js";
export declare const LIVE_PUBLICATION_CONTRACT_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/live-publication-contract.schema.json";
export declare const livePublicationContractSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/live-publication-contract.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publication_package_id", "canonical_contract_ref", "publication_metadata", "activation_policy", "safety_checks", "contract_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lpct_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_contract_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly publication_metadata: {
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
        readonly activation_policy: {
            readonly type: "string";
            readonly enum: ActivationPolicy[];
        };
        readonly safety_checks: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly contract_status: {
            readonly type: "string";
            readonly enum: ContractStatus[];
        };
    };
};
//# sourceMappingURL=live-publication-contract.schema.d.ts.map