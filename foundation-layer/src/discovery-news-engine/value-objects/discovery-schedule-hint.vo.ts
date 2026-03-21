import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type DiscoveryScheduleHint = Readonly<{
  cronExpressionNullable: string | null;
  intervalSecondsNullable: number | null;
}>;

export const createDiscoveryScheduleHint = (
  input: DiscoveryScheduleHint,
): DiscoveryScheduleHint =>
  deepFreeze({
    cronExpressionNullable: input.cronExpressionNullable ?? null,
    intervalSecondsNullable: input.intervalSecondsNullable ?? null,
  });
