import type { BreadcrumbItem } from "../../value-objects/breadcrumb-item.vo.js";
export type BreadcrumbState = Readonly<{
    items: readonly BreadcrumbItem[];
}>;
export declare const createBreadcrumbState: (input: BreadcrumbState) => BreadcrumbState;
//# sourceMappingURL=breadcrumb-state.entity.d.ts.map