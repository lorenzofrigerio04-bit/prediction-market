import type { Branded } from "../../common/types/branded.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";

export type DeliveryNote = Branded<string, "DeliveryNote">;

export const createDeliveryNote = (value: string): DeliveryNote =>
  assertNonEmpty(value, "delivery_note") as DeliveryNote;
