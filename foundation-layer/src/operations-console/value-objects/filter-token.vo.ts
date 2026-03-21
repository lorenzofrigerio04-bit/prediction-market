import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyConsoleText } from "./operations-console-shared.vo.js";

export type FilterToken = Branded<string, "FilterToken">;

export const createFilterToken = (value: string): FilterToken =>
  createNonEmptyConsoleText(value, "INVALID_FILTER_TOKEN", "filter_token") as FilterToken;
