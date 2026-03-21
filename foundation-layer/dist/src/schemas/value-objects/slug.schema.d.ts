export declare const SLUG_SCHEMA_ID = "https://market-design-engine.dev/schemas/value-objects/slug.schema.json";
export declare const slugSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/value-objects/slug.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "string";
    readonly pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$";
    readonly minLength: 1;
    readonly maxLength: 240;
};
//# sourceMappingURL=slug.schema.d.ts.map