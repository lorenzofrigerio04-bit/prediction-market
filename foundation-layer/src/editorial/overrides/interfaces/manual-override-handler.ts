import type { ManualOverride } from "../entities/manual-override.entity.js";

export interface ManualOverrideHandler {
  applyOverride(input: ManualOverride): ManualOverride;
}
