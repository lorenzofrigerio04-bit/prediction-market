import { createTimestamp, type Timestamp } from "../../../value-objects/timestamp.vo.js";
import { CounterType } from "../../enums/counter-type.enum.js";
import { MeasurementWindowUnit } from "../../enums/measurement-window-unit.enum.js";
import { createUsageCounter } from "../entities/usage-counter.entity.js";
import type { UsageCounter } from "../entities/usage-counter.entity.js";
import type { UsageCounterManager } from "../interfaces/usage-counter-manager.js";
import {
  createOwnerRef,
  createUsageCounterId,
  createVersion,
  createWindowDefinition,
  type OwnerRef,
  type WindowDefinitionVo,
} from "../../value-objects/index.js";

export class DeterministicUsageCounterManager implements UsageCounterManager {
  incrementCounter(counter: UsageCounter, delta: number): UsageCounter {
    const next = Math.max(0, counter.measured_value + delta);
    return { ...counter, measured_value: next, updated_at: createTimestamp("1970-01-01T00:00:00.000Z") };
  }

  resetCounter(counter: UsageCounter): UsageCounter {
    return { ...counter, measured_value: 0, updated_at: createTimestamp("1970-01-01T00:00:00.000Z") };
  }

  mergeCounters(counters: readonly UsageCounter[]): UsageCounter {
    const total = counters.reduce((acc, item) => acc + item.measured_value, 0);
    const base = counters[0];
    if (base === undefined) {
      return createUsageCounter({
        id: createUsageCounterId("vuc_defaultcounter001"),
        version: createVersion("v1.0.0"),
        owner_ref: createOwnerRef("owner:unknown"),
        counter_type: CounterType.CONSUMED_CREDITS,
        measured_value: 0,
        measurement_window: createWindowDefinition({ unit: MeasurementWindowUnit.DAY, size: 1 }),
        updated_at: createTimestamp("1970-01-01T00:00:00.000Z"),
        consistency_notes_nullable: null,
      });
    }
    return { ...base, measured_value: total, updated_at: createTimestamp("1970-01-01T00:00:00.000Z") };
  }

  buildWindowedCounter(
    ownerRef: OwnerRef,
    counterType: CounterType,
    measurementWindow: WindowDefinitionVo,
    updatedAt: Timestamp,
  ): UsageCounter {
    return createUsageCounter({
      id: createUsageCounterId("vuc_windowcounter001"),
      version: createVersion("v1.0.0"),
      owner_ref: ownerRef,
      counter_type: counterType,
      measured_value: 0,
      measurement_window: measurementWindow,
      updated_at: updatedAt,
      consistency_notes_nullable: null,
    });
  }
}
