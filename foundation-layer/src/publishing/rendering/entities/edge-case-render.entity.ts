import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createOrderedRenderItems } from "../../value-objects/rendering.vo.js";
import { createTextBlock } from "../../value-objects/publishing-shared.vo.js";

export type EdgeCaseRender = Readonly<{
  edge_case_items: readonly string[];
  invalidation_items: readonly string[];
  notes_nullable: string | null;
}>;

export const createEdgeCaseRender = (input: EdgeCaseRender): EdgeCaseRender =>
  deepFreeze({
    ...input,
    edge_case_items: createOrderedRenderItems(input.edge_case_items, "edge_case_items"),
    invalidation_items: createOrderedRenderItems(input.invalidation_items, "invalidation_items"),
    notes_nullable:
      input.notes_nullable === null ? null : createTextBlock(input.notes_nullable, "notes_nullable"),
  });
