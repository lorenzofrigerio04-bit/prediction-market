import { WorkflowState } from "../../enums/workflow-state.enum.js";
export declare const WORKFLOW_INSTANCE_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/workflow-instance.schema.json";
export declare const workflowInstanceSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/entities/workflow-instance.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["workflowId", "targetType", "targetId", "currentState", "previousState", "transitionHistory", "lastTransitionAt", "entityVersion"];
    readonly properties: {
        readonly workflowId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly targetType: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly targetId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly currentState: {
            readonly type: "string";
            readonly enum: WorkflowState[];
        };
        readonly previousState: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly enum: WorkflowState[];
            }, {
                readonly type: "null";
            }];
        };
        readonly transitionHistory: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/shared.schema.json#/$defs/workflowTransitionRecord";
            };
        };
        readonly lastTransitionAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
};
//# sourceMappingURL=workflow-instance.schema.d.ts.map