import { ValidatorSeverity } from "../../enums/validator-severity.enum.js";
import { WorkflowState } from "../../enums/workflow-state.enum.js";
import { WorkflowTransition } from "../../enums/workflow-transition.enum.js";

export const SHARED_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/common/shared.schema.json";

export const sharedSchema = {
  $id: SHARED_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $defs: {
    validationIssue: {
      type: "object",
      additionalProperties: false,
      required: ["code", "path", "message", "severity"],
      properties: {
        code: { type: "string", minLength: 1 },
        path: { type: "string" },
        message: { type: "string", minLength: 1 },
        severity: { type: "string", enum: Object.values(ValidatorSeverity) },
        context: { type: "object", additionalProperties: true },
      },
    },
    workflowTransitionRecord: {
      type: "object",
      additionalProperties: false,
      required: ["from", "to", "transition", "at", "reason", "actor"],
      properties: {
        from: {
          oneOf: [
            { type: "string", enum: Object.values(WorkflowState) },
            { type: "null" },
          ],
        },
        to: { type: "string", enum: Object.values(WorkflowState) },
        transition: { type: "string", enum: Object.values(WorkflowTransition) },
        at: { type: "string", format: "date-time" },
        reason: { type: ["string", "null"] },
        actor: { type: ["string", "null"] },
      },
    },
  },
} as const;
