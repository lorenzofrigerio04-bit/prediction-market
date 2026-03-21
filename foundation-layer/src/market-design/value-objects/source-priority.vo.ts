import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { SourceClass } from "../../sources/enums/source-class.enum.js";

export type SourcePriorityItem = Readonly<{
  source_class: SourceClass;
  priority_rank: number;
}>;

export const createSourcePriorityItem = (input: SourcePriorityItem): SourcePriorityItem => {
  if (!Object.values(SourceClass).includes(input.source_class)) {
    throw new ValidationError("INVALID_SOURCE_PRIORITY_ITEM", "source_class is invalid", {
      source_class: input.source_class,
    });
  }
  if (!Number.isInteger(input.priority_rank) || input.priority_rank < 1) {
    throw new ValidationError(
      "INVALID_SOURCE_PRIORITY_ITEM",
      "priority_rank must be an integer >= 1",
      {
        priority_rank: input.priority_rank,
      },
    );
  }
  return deepFreeze(input);
};
