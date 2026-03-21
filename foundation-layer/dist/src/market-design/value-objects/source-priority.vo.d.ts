import { SourceClass } from "../../sources/enums/source-class.enum.js";
export type SourcePriorityItem = Readonly<{
    source_class: SourceClass;
    priority_rank: number;
}>;
export declare const createSourcePriorityItem: (input: SourcePriorityItem) => SourcePriorityItem;
//# sourceMappingURL=source-priority.vo.d.ts.map