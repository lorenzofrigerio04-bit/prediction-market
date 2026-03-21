import type { Branded } from "../common/types/branded.js";
import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";

export type Timestamp = Branded<string, "Timestamp">;

export type DateRange = Readonly<{
  start: Timestamp;
  end: Timestamp;
}>;

export type ResolutionWindow = Readonly<{
  openAt: Timestamp;
  closeAt: Timestamp;
}>;

const parseAsDate = (value: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError("INVALID_TIMESTAMP", "Invalid timestamp", { value });
  }
  return date;
};

export const createTimestamp = (value: string | Date): Timestamp => {
  const asDate = typeof value === "string" ? parseAsDate(value) : value;
  if (Number.isNaN(asDate.getTime())) {
    throw new ValidationError("INVALID_TIMESTAMP", "Invalid timestamp", { value });
  }
  return asDate.toISOString() as Timestamp;
};

export const createDateRange = (
  start: string | Date | Timestamp,
  end: string | Date | Timestamp,
): DateRange => {
  const startTs = createTimestamp(start);
  const endTs = createTimestamp(end);
  if (Date.parse(startTs) > Date.parse(endTs)) {
    throw new ValidationError("INVALID_DATE_RANGE", "DateRange start must be <= end", {
      start: startTs,
      end: endTs,
    });
  }
  return deepFreeze({ start: startTs, end: endTs });
};

export const createResolutionWindow = (
  openAt: string | Date | Timestamp,
  closeAt: string | Date | Timestamp,
): ResolutionWindow => {
  const open = createTimestamp(openAt);
  const close = createTimestamp(closeAt);
  if (Date.parse(open) > Date.parse(close)) {
    throw new ValidationError(
      "INVALID_RESOLUTION_WINDOW",
      "ResolutionWindow openAt must be <= closeAt",
      { openAt: open, closeAt: close },
    );
  }
  return deepFreeze({ openAt: open, closeAt: close });
};
