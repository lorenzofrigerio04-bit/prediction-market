export declare class DomainError extends Error {
    readonly code: string;
    readonly context: Record<string, unknown> | undefined;
    constructor(code: string, message: string, context?: Record<string, unknown>);
}
//# sourceMappingURL=domain-error.d.ts.map