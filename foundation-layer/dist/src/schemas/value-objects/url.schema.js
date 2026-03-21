export const URL_SCHEMA_ID = "https://market-design-engine.dev/schemas/value-objects/url.schema.json";
export const urlSchema = {
    $id: URL_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "string",
    format: "uri",
    pattern: "^https?://",
};
//# sourceMappingURL=url.schema.js.map