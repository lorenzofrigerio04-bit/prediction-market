import type { RevisionRecord } from "../entities/revision-record.entity.js";
import type { RevisionTracker } from "../interfaces/revision-tracker.js";
export declare class DeterministicRevisionTracker implements RevisionTracker {
    private readonly byTarget;
    append(record: RevisionRecord): RevisionRecord;
    listForTarget(targetType: string, targetId: string): readonly RevisionRecord[];
}
//# sourceMappingURL=deterministic-revision-tracker.d.ts.map