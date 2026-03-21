import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { SOURCE_HIERARCHY_SELECTION_SCHEMA_ID } from "../../schemas/source-hierarchy-selection.schema.js";
const validateSourceHierarchySelectionInvariants = (input) => {
    const issues = [];
    if (input.candidate_source_classes.length === 0) {
        issues.push(errorIssue("EMPTY_CANDIDATE_SOURCE_CLASSES", "/candidate_source_classes", "candidate_source_classes must not be empty"));
    }
    const candidateSet = new Set(input.candidate_source_classes);
    for (const [index, item] of input.selected_source_priority.entries()) {
        if (!candidateSet.has(item.source_class)) {
            issues.push(errorIssue("INVALID_SOURCE_PRIORITY_MISMATCH", `/selected_source_priority/${index}/source_class`, "selected source_class must exist in candidate_source_classes"));
        }
    }
    const seenPriorityRanks = new Set();
    for (const [index, item] of input.selected_source_priority.entries()) {
        if (seenPriorityRanks.has(item.priority_rank)) {
            issues.push(errorIssue("DUPLICATE_SOURCE_PRIORITY_RANK", `/selected_source_priority/${index}/priority_rank`, "selected_source_priority priority_rank values must be unique"));
        }
        seenPriorityRanks.add(item.priority_rank);
    }
    return issues;
};
export const validateSourceHierarchySelection = (input, options) => {
    const schemaValidator = requireSchemaValidator(SOURCE_HIERARCHY_SELECTION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateSourceHierarchySelectionInvariants(input)];
    return buildValidationReport("SourceHierarchySelection", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-source-hierarchy-selection.js.map