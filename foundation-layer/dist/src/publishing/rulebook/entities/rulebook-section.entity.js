import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { RulebookSectionType } from "../../enums/rulebook-section-type.enum.js";
import { createTextBlock } from "../../value-objects/publishing-shared.vo.js";
export const createRulebookSection = (input) => {
    if (!Object.values(RulebookSectionType).includes(input.section_type)) {
        throw new ValidationError("INVALID_RULEBOOK_SECTION", "section_type is invalid");
    }
    if (!Number.isInteger(input.ordering_index) || input.ordering_index < 0) {
        throw new ValidationError("INVALID_RULEBOOK_SECTION", "ordering_index must be an integer greater than or equal to 0");
    }
    return deepFreeze({
        ...input,
        title: createTextBlock(input.title, "title"),
        body: createTextBlock(input.body, "body"),
    });
};
//# sourceMappingURL=rulebook-section.entity.js.map