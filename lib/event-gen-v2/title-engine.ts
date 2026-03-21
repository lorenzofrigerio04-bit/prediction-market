/**
 * Title Engine - Wrapper over event-templates
 * Templates produce rulebook-compliant titles and resolution criteria
 */

export {
  getCategoryFromHost,
  getSpecificTemplateForHost,
  getUniversalFallbackTemplate,
} from '../event-templates/catalog';
export type { EventTemplate } from '../event-templates/types';
