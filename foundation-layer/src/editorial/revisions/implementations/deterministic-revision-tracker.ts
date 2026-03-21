import type { RevisionRecord } from "../entities/revision-record.entity.js";
import { createRevisionRecord } from "../entities/revision-record.entity.js";
import type { RevisionTracker } from "../interfaces/revision-tracker.js";

export class DeterministicRevisionTracker implements RevisionTracker {
  private readonly byTarget = new Map<string, RevisionRecord[]>();

  append(record: RevisionRecord): RevisionRecord {
    const validated = createRevisionRecord(record);
    const key = `${validated.target_entity_type}|${validated.target_entity_id}`;
    const current = this.byTarget.get(key) ?? [];
    const previous = current[current.length - 1];
    if (previous !== undefined && validated.revision_number <= previous.revision_number) {
      throw new Error("REVISION_NUMBER_NOT_MONOTONIC");
    }
    const next = [...current, validated];
    this.byTarget.set(key, next);
    return validated;
  }

  listForTarget(targetType: string, targetId: string): readonly RevisionRecord[] {
    const key = `${targetType}|${targetId}`;
    return this.byTarget.get(key) ?? [];
  }
}
