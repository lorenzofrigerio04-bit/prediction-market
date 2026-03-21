import { DomainError } from "./domain-error.js";
export class ValidationError extends DomainError {
    constructor(code, message, context) {
        super(code, message, context);
        this.name = "ValidationError";
    }
}
//# sourceMappingURL=validation-error.js.map