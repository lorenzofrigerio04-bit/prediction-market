import { DependencyStrength } from "../enums/dependency-strength.enum.js";
import { DependencyType } from "../enums/dependency-type.enum.js";
export declare const DEPENDENCY_LINK_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/dependency-link.schema.json";
export declare const dependencyLinkSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/dependency-link.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "source_ref", "target_ref", "dependency_type", "dependency_strength", "blocking"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_ref: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["ref_type", "ref_id"];
            readonly properties: {
                readonly ref_type: {
                    readonly type: "string";
                    readonly enum: readonly ["event", "market", "contract"];
                };
                readonly ref_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly target_ref: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["ref_type", "ref_id"];
            readonly properties: {
                readonly ref_type: {
                    readonly type: "string";
                    readonly enum: readonly ["event", "market", "contract"];
                };
                readonly ref_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly dependency_type: {
            readonly type: "string";
            readonly enum: DependencyType[];
        };
        readonly dependency_strength: {
            readonly type: "string";
            readonly enum: DependencyStrength[];
        };
        readonly blocking: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=dependency-link.schema.d.ts.map