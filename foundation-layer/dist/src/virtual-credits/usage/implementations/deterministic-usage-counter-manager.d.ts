import { type Timestamp } from "../../../value-objects/timestamp.vo.js";
import { CounterType } from "../../enums/counter-type.enum.js";
import type { UsageCounter } from "../entities/usage-counter.entity.js";
import type { UsageCounterManager } from "../interfaces/usage-counter-manager.js";
import { type OwnerRef, type WindowDefinitionVo } from "../../value-objects/index.js";
export declare class DeterministicUsageCounterManager implements UsageCounterManager {
    incrementCounter(counter: UsageCounter, delta: number): UsageCounter;
    resetCounter(counter: UsageCounter): UsageCounter;
    mergeCounters(counters: readonly UsageCounter[]): UsageCounter;
    buildWindowedCounter(ownerRef: OwnerRef, counterType: CounterType, measurementWindow: WindowDefinitionVo, updatedAt: Timestamp): UsageCounter;
}
//# sourceMappingURL=deterministic-usage-counter-manager.d.ts.map