import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type DeliveryReadinessReportId = Branded<string, "DeliveryReadinessReportId">;

export const createDeliveryReadinessReportId = (value: string): DeliveryReadinessReportId =>
  createPrefixedId(value, "drrp_", "DeliveryReadinessReportId") as DeliveryReadinessReportId;
