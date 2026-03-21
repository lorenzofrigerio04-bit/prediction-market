import { EvidenceSpanKind } from "../enums/evidence-span-kind.enum.js";
export type EvidenceSpan = Readonly<{
    spanId: string;
    kind: EvidenceSpanKind;
    locator: string;
    startOffset: number | null;
    endOffset: number | null;
    extractedText: string | null;
    mappedField: string | null;
}>;
export declare const createEvidenceSpan: (input: EvidenceSpan) => EvidenceSpan;
//# sourceMappingURL=evidence-span.vo.d.ts.map