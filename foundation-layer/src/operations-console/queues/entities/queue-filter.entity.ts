import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { FilterOperator } from "../../enums/filter-operator.enum.js";
import type { FilterToken } from "../../value-objects/filter-token.vo.js";

export type QueueFilter = Readonly<{
  field: string;
  operator: FilterOperator;
  value: FilterToken;
}>;

export const createQueueFilter = (input: QueueFilter): QueueFilter => deepFreeze({ ...input });
