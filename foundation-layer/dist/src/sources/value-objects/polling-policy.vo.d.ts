export type PollingPolicy = Readonly<{
    intervalSeconds: number;
    jitterSeconds: number;
}>;
export declare const createPollingPolicy: (input: PollingPolicy) => PollingPolicy;
//# sourceMappingURL=polling-policy.vo.d.ts.map