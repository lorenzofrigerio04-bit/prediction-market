export const PRIMITIVES_SCHEMA_ID = "https://market-design-engine.dev/schemas/common/primitives.schema.json";
export const primitivesSchema = {
    $id: PRIMITIVES_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $defs: {
        idString: { type: "string", minLength: 10, maxLength: 80 },
        eventId: {
            type: "string",
            pattern: "^evt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
        sourceId: {
            type: "string",
            pattern: "^src_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
        sourceDefinitionId: {
            type: "string",
            pattern: "^sdef_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
        sourceObservationId: {
            type: "string",
            pattern: "^obs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
        claimId: {
            type: "string",
            pattern: "^clm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
        candidateMarketId: {
            type: "string",
            pattern: "^mkt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
        outcomeId: {
            type: "string",
            pattern: "^out_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
        nonEmptyString: {
            type: "string",
            minLength: 1,
        },
        isoTimestamp: { type: "string", format: "date-time" },
        score01: { type: "number", minimum: 0, maximum: 1 },
        nullableString: {
            oneOf: [{ type: "string" }, { type: "null" }],
        },
        tag: {
            type: "string",
            pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            minLength: 1,
            maxLength: 32,
        },
        locale: {
            type: "string",
            pattern: "^[a-z]{2,3}(?:-[A-Z]{2}|-[a-zA-Z0-9]{2,8})?$",
        },
        languageCode: {
            type: "string",
            pattern: "^[a-z]{2,3}(?:-[A-Z]{2}|-[a-zA-Z0-9]{2,8})?$",
        },
        discoverySourceId: {
            type: "string",
            pattern: "^dsrc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
        discoverySignalId: {
            type: "string",
            pattern: "^dsig_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
        discoveryRunId: {
            type: "string",
            pattern: "^drun_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
        discoveryJobId: {
            type: "string",
            pattern: "^djob_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
        },
    },
};
//# sourceMappingURL=primitives.schema.js.map