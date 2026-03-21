export class DomainError extends Error {
    code;
    context;
    constructor(code, message, context) {
        super(message);
        this.name = "DomainError";
        this.code = code;
        this.context = context;
    }
}
//# sourceMappingURL=domain-error.js.map