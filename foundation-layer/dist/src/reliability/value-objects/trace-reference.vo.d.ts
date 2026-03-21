export type TraceReference = Readonly<{
    trace_id: string;
    span_id_nullable: string | null;
    parent_trace_id_nullable: string | null;
}>;
export declare const createTraceReference: (input: TraceReference) => TraceReference;
export declare const createTraceReferenceCollection: (input: readonly TraceReference[]) => readonly TraceReference[];
//# sourceMappingURL=trace-reference.vo.d.ts.map