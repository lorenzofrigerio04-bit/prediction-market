import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { CounterType } from "../../enums/counter-type.enum.js";
import type { Note, OwnerRef, UsageCounterId, Version, WindowDefinitionVo } from "../../value-objects/index.js";
export type UsageCounter = Readonly<{
    id: UsageCounterId;
    version: Version;
    owner_ref: OwnerRef;
    counter_type: CounterType;
    measured_value: number;
    measurement_window: WindowDefinitionVo;
    updated_at: Timestamp;
    consistency_notes_nullable: Note | null;
}>;
export declare const createUsageCounter: (input: UsageCounter) => UsageCounter;
//# sourceMappingURL=usage-counter.entity.d.ts.map