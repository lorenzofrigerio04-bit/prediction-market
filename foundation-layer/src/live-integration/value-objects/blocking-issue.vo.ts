import type { Branded } from "../../common/types/branded.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";

export type BlockingIssue = Branded<string, "BlockingIssue">;

export const createBlockingIssue = (value: string): BlockingIssue =>
  assertNonEmpty(value, "blocking_issue") as BlockingIssue;
