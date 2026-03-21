import { ActionKey } from "../../enums/action-key.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import { type PlatformActionCompatibility } from "../entities/platform-action-compatibility.entity.js";
import type { PlatformCompatibilityAdapter } from "../interfaces/platform-compatibility-adapter.js";
export declare class DeterministicPlatformCompatibilityAdapter implements PlatformCompatibilityAdapter {
    listCompatibilityForAction(action_key: ActionKey): readonly PlatformActionCompatibility[];
    findByModuleAndAction(target_module: TargetModule, action_key: ActionKey): PlatformActionCompatibility | null;
    private buildCompatibility;
}
//# sourceMappingURL=deterministic-platform-compatibility-adapter.d.ts.map