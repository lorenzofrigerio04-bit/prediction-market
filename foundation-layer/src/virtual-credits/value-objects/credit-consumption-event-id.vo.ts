import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type CreditConsumptionEventId = Branded<string, "CreditConsumptionEventId">;

export const createCreditConsumptionEventId = (value: string): CreditConsumptionEventId =>
  createPrefixedId(value, "vce_", "CreditConsumptionEventId");
