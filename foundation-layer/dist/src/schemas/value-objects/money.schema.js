export const MONEY_SCHEMA_ID = "https://market-design-engine.dev/schemas/value-objects/money.schema.json";
export const moneySchema = {
    $id: MONEY_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["currency", "amount"],
    properties: {
        currency: {
            type: "string",
            pattern: "^[A-Z]{3}$",
        },
        amount: {
            type: "string",
            pattern: "^-?\\d+(?:\\.\\d{1,8})?$",
        },
    },
};
//# sourceMappingURL=money.schema.js.map