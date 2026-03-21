import { UserStatus } from "../enums/user-status.enum.js";
import { UserType } from "../enums/user-type.enum.js";
export const USER_IDENTITY_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/user-identity.schema.json";
export const userIdentitySchema = {
    $id: USER_IDENTITY_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "display_name",
        "user_type",
        "status",
        "primary_workspace_id_nullable",
        "capability_flags",
        "metadata",
    ],
    properties: {
        id: { type: "string", pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        display_name: { type: "string", minLength: 1 },
        user_type: { type: "string", enum: Object.values(UserType) },
        status: { type: "string", enum: Object.values(UserStatus) },
        primary_workspace_id_nullable: {
            anyOf: [{ type: "null" }, { type: "string", pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }],
        },
        capability_flags: {
            type: "array",
            items: { type: "string", minLength: 1 },
            uniqueItems: true,
        },
        metadata: { type: "object" },
    },
};
//# sourceMappingURL=user-identity.schema.js.map