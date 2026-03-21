import { ContractSelectionStatus } from "../enums/contract-selection-status.enum.js";
import { OPERATIVE_CONTRACT_TYPES } from "../enums/contract-type.enum.js";

export const CONTRACT_SELECTION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/market-design/contract-selection.schema.json";

export const contractSelectionSchema = {
  $id: CONTRACT_SELECTION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "canonical_event_id",
    "status",
    "selected_contract_type",
    "contract_type_reason",
    "selection_confidence",
    "rejected_contract_types",
    "selection_metadata",
  ],
  properties: {
    id: { type: "string", pattern: "^csel_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    canonical_event_id: {
      $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId",
    },
    status: { type: "string", enum: Object.values(ContractSelectionStatus) },
    selected_contract_type: { type: "string", enum: [...OPERATIVE_CONTRACT_TYPES] },
    contract_type_reason: { type: "string", minLength: 1 },
    selection_confidence: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
    },
    rejected_contract_types: {
      type: "array",
      uniqueItems: true,
      items: { type: "string", enum: [...OPERATIVE_CONTRACT_TYPES] },
    },
    selection_metadata: { type: "object", additionalProperties: true },
  },
} as const;
