export const SLUG_SCHEMA_ID = "https://market-design-engine.dev/schemas/value-objects/slug.schema.json";
export const slugSchema = {
    $id: SLUG_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "string",
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    minLength: 1,
    maxLength: 240,
};
//# sourceMappingURL=slug.schema.js.map