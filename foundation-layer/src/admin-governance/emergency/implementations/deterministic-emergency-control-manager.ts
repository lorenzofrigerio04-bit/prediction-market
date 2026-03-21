import { EmergencyState } from "../../enums/emergency-state.enum.js";
import type { ModuleKey } from "../../value-objects/module-key.vo.js";
import type { EmergencyControl } from "../entities/emergency-control.entity.js";
import type { EmergencyControlManager } from "../interfaces/emergency-control-manager.js";

export class DeterministicEmergencyControlManager implements EmergencyControlManager {
  private readonly byModule = new Map<ModuleKey, EmergencyControl>();

  upsert(control: EmergencyControl): EmergencyControl {
    this.byModule.set(control.module_key, control);
    return control;
  }

  getCurrentByModule(moduleKey: ModuleKey): EmergencyControl | null {
    const value = this.byModule.get(moduleKey);
    if (value === undefined) {
      return null;
    }
    if (value.state === EmergencyState.NORMAL) {
      return null;
    }
    return value;
  }
}
