export declare const MONEY_SCHEMA_ID = "https://market-design-engine.dev/schemas/value-objects/money.schema.json";
export declare const moneySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/value-objects/money.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["currency", "amount"];
    readonly properties: {
        readonly currency: {
            readonly type: "string";
            readonly pattern: "^[A-Z]{3}$";
        };
        readonly amount: {
            readonly type: "string";
            readonly pattern: "^-?\\d+(?:\\.\\d{1,8})?$";
        };
    };
};
//# sourceMappingURL=money.schema.d.ts.map