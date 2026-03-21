import { WorkflowState } from "../../enums/workflow-state.enum.js";

export const WORKFLOW_INSTANCE_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/entities/workflow-instance.schema.json";

export const workflowInstanceSchema = {
  $id: WORKFLOW_INSTANCE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "workflowId",
    "targetType",
    "targetId",
    "currentState",
    "previousState",
    "transitionHistory",
    "lastTransitionAt",
    "entityVersion",
  ],
  properties: {
    workflowId: { type: "string", minLength: 1 },
    targetType: { type: "string", minLength: 1 },
    targetId: { type: "string", minLength: 1 },
    currentState: { type: "string", enum: Object.values(WorkflowState) },
    previousState: {
      oneOf: [
        { type: "string", enum: Object.values(WorkflowState) },
        { type: "null" },
      ],
    },
    transitionHistory: {
      type: "array",
      minItems: 1,
      items: {
        $ref: "https://market-design-engine.dev/schemas/common/shared.schema.json#/$defs/workflowTransitionRecord",
      },
    },
    lastTransitionAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
    entityVersion: { type: "integer", minimum: 1 },
  },
} as const;
