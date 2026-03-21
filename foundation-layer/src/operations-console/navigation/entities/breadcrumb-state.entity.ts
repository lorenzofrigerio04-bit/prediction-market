import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { BreadcrumbItem } from "../../value-objects/breadcrumb-item.vo.js";

export type BreadcrumbState = Readonly<{
  items: readonly BreadcrumbItem[];
}>;

export const createBreadcrumbState = (input: BreadcrumbState): BreadcrumbState => deepFreeze({ ...input });
