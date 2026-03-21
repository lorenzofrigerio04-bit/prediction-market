import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { DeterministicMetadata } from "../../value-objects/publishing-shared.vo.js";
import { createDeterministicMetadata, createTextBlock } from "../../value-objects/publishing-shared.vo.js";

export type TimePolicyRender = Readonly<{
  timezone: string;
  deadline_text: string;
  close_time_text: string;
  cutoff_text_nullable: string | null;
  policy_notes: readonly string[];
  metadata: DeterministicMetadata;
}>;

export const createTimePolicyRender = (input: TimePolicyRender): TimePolicyRender =>
  deepFreeze({
    ...input,
    timezone: createTextBlock(input.timezone, "timezone"),
    deadline_text: createTextBlock(input.deadline_text, "deadline_text"),
    close_time_text: createTextBlock(input.close_time_text, "close_time_text"),
    cutoff_text_nullable:
      input.cutoff_text_nullable === null
        ? null
        : createTextBlock(input.cutoff_text_nullable, "cutoff_text_nullable"),
    policy_notes: Object.freeze(
      input.policy_notes.map((item, index) => createTextBlock(item, `policy_notes[${index}]`)),
    ),
    metadata: createDeterministicMetadata(input.metadata as Record<string, unknown>, "metadata"),
  });
