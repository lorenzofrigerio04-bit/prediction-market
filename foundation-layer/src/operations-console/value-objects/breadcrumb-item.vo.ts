import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyConsoleText } from "./operations-console-shared.vo.js";

export type BreadcrumbItem = Branded<string, "BreadcrumbItem">;

export const createBreadcrumbItem = (value: string): BreadcrumbItem =>
  createNonEmptyConsoleText(value, "INVALID_BREADCRUMB_ITEM", "breadcrumb_item") as BreadcrumbItem;
