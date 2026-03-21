import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { OperationsConsoleCompatibilityResultId } from "../../value-objects/operations-console-ids.vo.js";

export type OperationsConsoleCompatibilityResult = Readonly<{
  id: OperationsConsoleCompatibilityResultId;
  source_module: string;
  target_contract: string;
  compatible: boolean;
  propagated_visibility: "visible" | "partial" | "hidden";
  propagated_allowed_actions: readonly string[];
  propagated_denied_actions: readonly string[];
  lossy_fields: readonly string[];
  notes: readonly string[];
}>;

export const createOperationsConsoleCompatibilityResult = (
  input: OperationsConsoleCompatibilityResult,
): OperationsConsoleCompatibilityResult => deepFreeze({ ...input });
