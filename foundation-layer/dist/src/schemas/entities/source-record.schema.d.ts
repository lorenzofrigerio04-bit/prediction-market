import { SourceType } from "../../enums/source-type.enum.js";
export declare const SOURCE_RECORD_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/source-record.schema.json";
export declare const sourceRecordSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/entities/source-record.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "sourceType", "sourceName", "sourceAuthorityScore", "title", "description", "url", "publishedAt", "capturedAt", "locale", "tags", "externalRef", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId";
        };
        readonly sourceType: {
            readonly type: "string";
            readonly enum: SourceType[];
        };
        readonly sourceName: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly sourceAuthorityScore: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly title: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json";
        };
        readonly description: {
            readonly type: readonly ["string", "null"];
        };
        readonly url: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/url.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly publishedAt: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly capturedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly locale: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/locale";
            }, {
                readonly type: "null";
            }];
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag";
            };
        };
        readonly externalRef: {
            readonly type: readonly ["string", "null"];
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
};
//# sourceMappingURL=source-record.schema.d.ts.map