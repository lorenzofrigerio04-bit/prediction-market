import { EmergencyState } from "../../enums/emergency-state.enum.js";
export class DeterministicEmergencyControlManager {
    byModule = new Map();
    upsert(control) {
        this.byModule.set(control.module_key, control);
        return control;
    }
    getCurrentByModule(moduleKey) {
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
//# sourceMappingURL=deterministic-emergency-control-manager.js.map