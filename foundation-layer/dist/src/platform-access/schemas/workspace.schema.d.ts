import { WorkspaceStatus } from "../enums/workspace-status.enum.js";
import { WorkspaceType } from "../enums/workspace-type.enum.js";
export declare const WORKSPACE_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/workspace.schema.json";
export declare const workspaceSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/workspace.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "workspace_key", "display_name", "workspace_type", "status", "governance_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly workspace_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly display_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly workspace_type: {
            readonly type: "string";
            readonly enum: WorkspaceType[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: WorkspaceStatus[];
        };
        readonly governance_metadata: {
            readonly type: "object";
        };
    };
};
//# sourceMappingURL=workspace.schema.d.ts.map