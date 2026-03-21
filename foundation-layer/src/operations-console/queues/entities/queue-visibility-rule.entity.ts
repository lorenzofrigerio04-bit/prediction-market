import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { VisibilityStatus } from "../../enums/visibility-status.enum.js";

export type QueueVisibilityRule = Readonly<{
  permission_key: string;
  expected_visibility: VisibilityStatus;
}>;

export const createQueueVisibilityRule = (input: QueueVisibilityRule): QueueVisibilityRule =>
  deepFreeze({ ...input });
