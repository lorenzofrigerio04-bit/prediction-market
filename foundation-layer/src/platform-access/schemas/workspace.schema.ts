import { WorkspaceStatus } from "../enums/workspace-status.enum.js";
import { WorkspaceType } from "../enums/workspace-type.enum.js";

export const WORKSPACE_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/platform-access/workspace.schema.json";

export const workspaceSchema = {
  $id: WORKSPACE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "version", "workspace_key", "display_name", "workspace_type", "status", "governance_metadata"],
  properties: {
    id: { type: "string", pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    workspace_key: { type: "string", minLength: 1 },
    display_name: { type: "string", minLength: 1 },
    workspace_type: { type: "string", enum: Object.values(WorkspaceType) },
    status: { type: "string", enum: Object.values(WorkspaceStatus) },
    governance_metadata: { type: "object" },
  },
} as const;
