import type { EmergencyControl } from "../entities/emergency-control.entity.js";
import type { ModuleKey } from "../../value-objects/module-key.vo.js";

export interface EmergencyControlManager {
  upsert(control: EmergencyControl): EmergencyControl;
  getCurrentByModule(moduleKey: ModuleKey): EmergencyControl | null;
}
