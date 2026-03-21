import { type QualityReport } from "../entities/quality-report.entity.js";
import type { QualityReporter, QualityReporterInput } from "../interfaces/quality-reporter.js";
export declare class DeterministicQualityReporter implements QualityReporter {
    generate(input: QualityReporterInput): QualityReport;
}
//# sourceMappingURL=deterministic-quality-reporter.d.ts.map