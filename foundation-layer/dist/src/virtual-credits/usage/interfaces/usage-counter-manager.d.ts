import type { UsageCounter } from "../entities/usage-counter.entity.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { CounterType } from "../../enums/counter-type.enum.js";
import type { OwnerRef, WindowDefinitionVo } from "../../value-objects/index.js";
export interface UsageCounterManager {
    incrementCounter(counter: UsageCounter, delta: number): UsageCounter;
    resetCounter(counter: UsageCounter): UsageCounter;
    mergeCounters(counters: readonly UsageCounter[]): UsageCounter;
    buildWindowedCounter(ownerRef: OwnerRef, counterType: CounterType, measurementWindow: WindowDefinitionVo, updatedAt: Timestamp): UsageCounter;
}
//# sourceMappingURL=usage-counter-manager.d.ts.map