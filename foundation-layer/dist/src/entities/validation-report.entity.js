import { deepFreeze } from "../common/utils/deep-freeze.js";
import { stableSort } from "../common/utils/stable-sort.js";
import { ValidatorSeverity } from "../enums/validator-severity.enum.js";
export const sortValidationIssues = (issues) => stableSort(issues, (left, right) => {
    const pathDiff = left.path.localeCompare(right.path);
    if (pathDiff !== 0) {
        return pathDiff;
    }
    const codeDiff = left.code.localeCompare(right.code);
    if (codeDiff !== 0) {
        return codeDiff;
    }
    return left.message.localeCompare(right.message);
});
export const createValidationReport = (input) => {
    const sortedIssues = sortValidationIssues(input.issues);
    const isValid = sortedIssues.length === 0;
    return deepFreeze({
        ...input,
        isValid,
        issues: sortedIssues,
    });
};
export const errorIssue = (code, path, message, context) => {
    const base = {
        code,
        path,
        message,
        severity: ValidatorSeverity.ERROR,
    };
    if (context === undefined) {
        return deepFreeze(base);
    }
    return deepFreeze({
        ...base,
        context,
    });
};
//# sourceMappingURL=validation-report.entity.js.map