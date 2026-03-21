import { UserStatus } from "../enums/user-status.enum.js";
import { UserType } from "../enums/user-type.enum.js";
export declare const USER_IDENTITY_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/user-identity.schema.json";
export declare const userIdentitySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/user-identity.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "display_name", "user_type", "status", "primary_workspace_id_nullable", "capability_flags", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly display_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly user_type: {
            readonly type: "string";
            readonly enum: UserType[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: UserStatus[];
        };
        readonly primary_workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly capability_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
};
//# sourceMappingURL=user-identity.schema.d.ts.map