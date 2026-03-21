import { deepFreeze } from "../../../common/utils/deep-freeze.js";

export type ReadinessGatingItem = Readonly<{
  key: string;
  satisfied: boolean;
  reason_nullable: string | null;
}>;

export const createReadinessGatingItem = (input: ReadinessGatingItem): ReadinessGatingItem =>
  deepFreeze({ ...input });
