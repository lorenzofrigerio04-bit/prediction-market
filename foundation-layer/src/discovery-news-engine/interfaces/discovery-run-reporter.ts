import type { DiscoveryRunResult } from "../entities/discovery-run-result.entity.js";

export interface DiscoveryRunReporter {
  report(result: DiscoveryRunResult): void;
}
