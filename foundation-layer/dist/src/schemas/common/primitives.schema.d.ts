export declare const PRIMITIVES_SCHEMA_ID = "https://market-design-engine.dev/schemas/common/primitives.schema.json";
export declare const primitivesSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/common/primitives.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $defs: {
        readonly idString: {
            readonly type: "string";
            readonly minLength: 10;
            readonly maxLength: 80;
        };
        readonly eventId: {
            readonly type: "string";
            readonly pattern: "^evt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly sourceId: {
            readonly type: "string";
            readonly pattern: "^src_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly sourceDefinitionId: {
            readonly type: "string";
            readonly pattern: "^sdef_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly sourceObservationId: {
            readonly type: "string";
            readonly pattern: "^obs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly claimId: {
            readonly type: "string";
            readonly pattern: "^clm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly candidateMarketId: {
            readonly type: "string";
            readonly pattern: "^mkt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly outcomeId: {
            readonly type: "string";
            readonly pattern: "^out_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly nonEmptyString: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly isoTimestamp: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly score01: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
        readonly nullableString: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly tag: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$";
            readonly minLength: 1;
            readonly maxLength: 32;
        };
        readonly locale: {
            readonly type: "string";
            readonly pattern: "^[a-z]{2,3}(?:-[A-Z]{2}|-[a-zA-Z0-9]{2,8})?$";
        };
        readonly languageCode: {
            readonly type: "string";
            readonly pattern: "^[a-z]{2,3}(?:-[A-Z]{2}|-[a-zA-Z0-9]{2,8})?$";
        };
        readonly discoverySourceId: {
            readonly type: "string";
            readonly pattern: "^dsrc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly discoverySignalId: {
            readonly type: "string";
            readonly pattern: "^dsig_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly discoveryRunId: {
            readonly type: "string";
            readonly pattern: "^drun_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly discoveryJobId: {
            readonly type: "string";
            readonly pattern: "^djob_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
};
//# sourceMappingURL=primitives.schema.d.ts.map