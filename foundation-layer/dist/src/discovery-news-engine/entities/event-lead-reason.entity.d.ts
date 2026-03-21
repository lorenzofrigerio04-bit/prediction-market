export type EventLeadReasonImpact = "positive" | "negative" | "neutral";
export type EventLeadReason = Readonly<{
    code: string;
    label: string;
    impact: EventLeadReasonImpact;
}>;
export declare const createEventLeadReason: (input: EventLeadReason) => EventLeadReason;
//# sourceMappingURL=event-lead-reason.entity.d.ts.map