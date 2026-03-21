import { ReadinessStatus } from "../enums/readiness-status.enum.js";
import { ViewScope } from "../enums/view-scope.enum.js";
import { FilterOperator } from "../enums/filter-operator.enum.js";
import { SortDirection } from "../enums/sort-direction.enum.js";

export const CANDIDATE_LIST_VIEW_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/operations-console/candidate-list-view.schema.json";

export const candidateListViewSchema = {
  $id: CANDIDATE_LIST_VIEW_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "version", "view_scope", "candidate_entries", "aggregate_counts", "applied_filters", "sort_config"],
  properties: {
    id: { type: "string", pattern: "^clv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    view_scope: { type: "string", enum: Object.values(ViewScope) },
    candidate_entries: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["candidate_ref", "title", "readiness_status", "warnings_count"],
        properties: {
          candidate_ref: { type: "string", pattern: "^cdr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
          title: { type: "string", minLength: 1 },
          readiness_status: { type: "string", enum: Object.values(ReadinessStatus) },
          warnings_count: { type: "integer", minimum: 0 },
        },
      },
    },
    aggregate_counts: { type: "object", additionalProperties: { type: "integer", minimum: 0 } },
    applied_filters: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["field", "operator", "value"],
        properties: {
          field: { type: "string", minLength: 1 },
          operator: { type: "string", enum: Object.values(FilterOperator) },
          value: { type: "string", minLength: 1 },
        },
      },
    },
    sort_config: {
      type: "object",
      additionalProperties: false,
      required: ["sort_field", "sort_direction"],
      properties: {
        sort_field: { type: "string", minLength: 1 },
        sort_direction: { type: "string", enum: Object.values(SortDirection) },
      },
    },
  },
} as const;
