/**
 * Candidate Event Templates - Template library per category
 */

export type {
  StructuredCandidateEvent,
  CandidateEventTemplate,
  TemplateCategory,
  TemplateContext,
} from './types';

export {
  getTemplateCategory,
  getTemplatesForCategory,
  getTemplateById,
  getAllTemplates,
} from './catalog';

export { cryptoTemplates, cryptoPriceThreshold, cryptoMarketCapThreshold } from './crypto';
export { sportsTemplates, sportsMatchWinner, sportsTournamentWinner } from './sports';
export { politicsTemplates, politicsElectionWinner, politicsNominationConfirmation } from './politics';
export { techTemplates, techProductRelease, techEarningsReport } from './tech';
export { economyTemplates, economyCPI, economyInterestRate, economyGDP } from './economy';
export { cultureTemplates, cultureAwardWinner, cultureBoxOfficeRevenue } from './culture';
