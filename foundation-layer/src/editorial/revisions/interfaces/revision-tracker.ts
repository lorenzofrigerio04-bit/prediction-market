import type { RevisionRecord } from "../entities/revision-record.entity.js";

export interface RevisionTracker {
  append(record: RevisionRecord): RevisionRecord;
  listForTarget(targetType: string, targetId: string): readonly RevisionRecord[];
}
