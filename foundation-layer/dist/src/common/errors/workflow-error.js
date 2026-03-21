import { DomainError } from "./domain-error.js";
export class WorkflowError extends DomainError {
    constructor(code, message, context) {
        super(code, message, context);
        this.name = "WorkflowError";
    }
}
//# sourceMappingURL=workflow-error.js.map