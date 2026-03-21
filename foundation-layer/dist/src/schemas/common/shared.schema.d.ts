import { ValidatorSeverity } from "../../enums/validator-severity.enum.js";
import { WorkflowState } from "../../enums/workflow-state.enum.js";
import { WorkflowTransition } from "../../enums/workflow-transition.enum.js";
export declare const SHARED_SCHEMA_ID = "https://market-design-engine.dev/schemas/common/shared.schema.json";
export declare const sharedSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/common/shared.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $defs: {
        readonly validationIssue: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "path", "message", "severity"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly path: {
                    readonly type: "string";
                };
                readonly message: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly severity: {
                    readonly type: "string";
                    readonly enum: ValidatorSeverity[];
                };
                readonly context: {
                    readonly type: "object";
                    readonly additionalProperties: true;
                };
            };
        };
        readonly workflowTransitionRecord: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["from", "to", "transition", "at", "reason", "actor"];
            readonly properties: {
                readonly from: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly enum: WorkflowState[];
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly to: {
                    readonly type: "string";
                    readonly enum: WorkflowState[];
                };
                readonly transition: {
                    readonly type: "string";
                    readonly enum: WorkflowTransition[];
                };
                readonly at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly reason: {
                    readonly type: readonly ["string", "null"];
                };
                readonly actor: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
    };
};
//# sourceMappingURL=shared.schema.d.ts.map