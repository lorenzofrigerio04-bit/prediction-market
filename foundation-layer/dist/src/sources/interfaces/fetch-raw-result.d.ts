import type { Timestamp } from "../../value-objects/timestamp.vo.js";
export type FetchRawResult<TRawPayload extends Record<string, unknown>> = Readonly<{
    payload: TRawPayload;
    fetchedAt: Timestamp;
    nextCursorNullable: string | null;
}>;
//# sourceMappingURL=fetch-raw-result.d.ts.map