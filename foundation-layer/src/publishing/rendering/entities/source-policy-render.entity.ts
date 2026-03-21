import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createOrderedRenderItems } from "../../value-objects/rendering.vo.js";
import { createTextBlock } from "../../value-objects/publishing-shared.vo.js";

export type SourcePolicyRender = Readonly<{
  selected_source_priority: readonly string[];
  source_policy_text: string;
  fallback_policy_text_nullable: string | null;
}>;

export const createSourcePolicyRender = (input: SourcePolicyRender): SourcePolicyRender =>
  deepFreeze({
    ...input,
    selected_source_priority: createOrderedRenderItems(
      input.selected_source_priority,
      "selected_source_priority",
    ),
    source_policy_text: createTextBlock(input.source_policy_text, "source_policy_text"),
    fallback_policy_text_nullable:
      input.fallback_policy_text_nullable === null
        ? null
        : createTextBlock(input.fallback_policy_text_nullable, "fallback_policy_text_nullable"),
  });
