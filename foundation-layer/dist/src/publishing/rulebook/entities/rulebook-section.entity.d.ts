import { RulebookSectionType } from "../../enums/rulebook-section-type.enum.js";
import type { RulebookSectionId } from "../../value-objects/publishing-ids.vo.js";
export type RulebookSection = Readonly<{
    id: RulebookSectionId;
    section_type: RulebookSectionType;
    title: string;
    body: string;
    ordering_index: number;
    required: boolean;
}>;
export declare const createRulebookSection: (input: RulebookSection) => RulebookSection;
//# sourceMappingURL=rulebook-section.entity.d.ts.map