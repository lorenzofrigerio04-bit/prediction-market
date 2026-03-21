import { createManualOverride, type ManualOverride } from "../entities/manual-override.entity.js";
import type { ManualOverrideHandler } from "../interfaces/manual-override-handler.js";

export class DeterministicManualOverrideHandler implements ManualOverrideHandler {
  applyOverride(input: ManualOverride): ManualOverride {
    return createManualOverride(input);
  }
}
