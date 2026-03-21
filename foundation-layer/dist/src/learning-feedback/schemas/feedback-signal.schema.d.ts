import { SignalType } from "../enums/signal-type.enum.js";
export declare const FEEDBACK_SIGNAL_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/feedback-signal.schema.json";
export declare const feedbackSignalSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/feedback-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["signal_type", "payload"];
    readonly properties: {
        readonly signal_type: {
            readonly type: "string";
            readonly enum: SignalType[];
        };
        readonly payload: {
            readonly type: "object";
        };
    };
};
//# sourceMappingURL=feedback-signal.schema.d.ts.map