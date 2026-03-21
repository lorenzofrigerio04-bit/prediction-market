import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyConsoleText } from "./operations-console-shared.vo.js";

export type BlockingIssue = Branded<string, "BlockingIssue">;

export const createBlockingIssue = (value: string): BlockingIssue =>
  createNonEmptyConsoleText(value, "INVALID_BLOCKING_ISSUE", "blocking_issue") as BlockingIssue;
