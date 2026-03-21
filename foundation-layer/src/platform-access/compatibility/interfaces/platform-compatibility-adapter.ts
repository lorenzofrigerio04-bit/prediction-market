import type { ActionKey } from "../../enums/action-key.enum.js";
import type { TargetModule } from "../../enums/target-module.enum.js";
import type { PlatformActionCompatibility } from "../entities/platform-action-compatibility.entity.js";

export interface PlatformCompatibilityAdapter {
  listCompatibilityForAction(action_key: ActionKey): readonly PlatformActionCompatibility[];
  findByModuleAndAction(target_module: TargetModule, action_key: ActionKey): PlatformActionCompatibility | null;
}
