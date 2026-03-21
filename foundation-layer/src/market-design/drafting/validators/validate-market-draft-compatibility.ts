import type { CandidateMarket } from "../../../entities/candidate-market.entity.js";
import { validateCandidateMarket } from "../../../validators/candidate-market.validator.js";
import { type ValidationReport } from "../../../entities/validation-report.entity.js";

export const validateMarketDraftCompatibility = (input: CandidateMarket): ValidationReport =>
  validateCandidateMarket(input);
