import { ActivationPolicy } from "../enums/activation-policy.enum.js";
import { ContractStatus } from "../enums/contract-status.enum.js";
import { ComplianceFlag } from "../enums/compliance-flag.enum.js";
import { MarketVisibility } from "../enums/market-visibility.enum.js";
export const LIVE_PUBLICATION_CONTRACT_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/live-publication-contract.schema.json";
export const livePublicationContractSchema = {
    $id: LIVE_PUBLICATION_CONTRACT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "publication_package_id",
        "canonical_contract_ref",
        "publication_metadata",
        "activation_policy",
        "safety_checks",
        "contract_status",
    ],
    properties: {
        id: { type: "string", pattern: "^lpct_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$" },
        publication_package_id: { type: "string", pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        canonical_contract_ref: { type: "string", minLength: 1 },
        publication_metadata: {
            type: "object",
            additionalProperties: false,
            required: [
                "category",
                "tags",
                "jurisdiction",
                "display_priority",
                "market_visibility",
                "compliance_flags",
            ],
            properties: {
                category: { type: "string", minLength: 1 },
                tags: { type: "array", items: { type: "string", minLength: 1 } },
                jurisdiction: { type: "string", pattern: "^[A-Z]{2,3}$" },
                display_priority: { type: "integer", minimum: 0 },
                market_visibility: { type: "string", enum: Object.values(MarketVisibility) },
                compliance_flags: { type: "array", items: { type: "string", enum: Object.values(ComplianceFlag) } },
            },
        },
        activation_policy: { type: "string", enum: Object.values(ActivationPolicy) },
        safety_checks: { type: "array", items: { type: "string", minLength: 1 } },
        contract_status: { type: "string", enum: Object.values(ContractStatus) },
    },
};
//# sourceMappingURL=live-publication-contract.schema.js.map