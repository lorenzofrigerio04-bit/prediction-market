import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActionKey } from "../../enums/action-key.enum.js";

export type ReadinessRecommendedAction = Readonly<{
  action_key: ActionKey;
  reason: string;
}>;

export const createReadinessRecommendedAction = (
  input: ReadinessRecommendedAction,
): ReadinessRecommendedAction => deepFreeze({ ...input });
