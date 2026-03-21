import type { ModuleKey } from "../../value-objects/module-key.vo.js";
import type { EmergencyControl } from "../entities/emergency-control.entity.js";
import type { EmergencyControlManager } from "../interfaces/emergency-control-manager.js";
export declare class DeterministicEmergencyControlManager implements EmergencyControlManager {
    private readonly byModule;
    upsert(control: EmergencyControl): EmergencyControl;
    getCurrentByModule(moduleKey: ModuleKey): EmergencyControl | null;
}
//# sourceMappingURL=deterministic-emergency-control-manager.d.ts.map