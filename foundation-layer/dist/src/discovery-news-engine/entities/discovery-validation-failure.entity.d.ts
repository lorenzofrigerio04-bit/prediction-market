export type DiscoveryValidationFailure = Readonly<{
    code: string;
    path: string;
    message: string;
    contextNullable: Record<string, unknown> | null;
}>;
export declare const createDiscoveryValidationFailure: (input: DiscoveryValidationFailure) => DiscoveryValidationFailure;
//# sourceMappingURL=discovery-validation-failure.entity.d.ts.map