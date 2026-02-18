/**
 * Test: Template Catalog
 * BLOCCO 4: Verifica che i template producano output validi
 */

import { TEMPLATE_CATALOG } from '../catalog';
import type { TemplateContext } from '../context';

describe('Template Catalog', () => {
  const mockContext: TemplateContext = {
    storylineId: 'test-123',
    authorityType: 'OFFICIAL',
    authorityHost: 'governo.it',
    entityA: 'Test Entity',
    topic: 'test topic',
    closesAt: new Date('2025-12-31'),
  };
  
  it('dovrebbe avere 35 template totali (5 per categoria)', () => {
    expect(TEMPLATE_CATALOG.length).toBe(35);
  });
  
  it('ogni template dovrebbe produrre question che termina con "?"', () => {
    for (const template of TEMPLATE_CATALOG) {
      const question = template.question(mockContext);
      expect(question).toMatch(/\?$/);
    }
  });
  
  it('ogni template dovrebbe produrre resolutionCriteria non vuoti', () => {
    for (const template of TEMPLATE_CATALOG) {
      const criteria = template.resolutionCriteria(mockContext);
      expect(criteria.yes).toBeTruthy();
      expect(criteria.yes.trim().length).toBeGreaterThan(0);
      expect(criteria.no).toBeTruthy();
      expect(criteria.no.trim().length).toBeGreaterThan(0);
    }
  });
  
  it('ogni template dovrebbe produrre criteria mutuamente esclusivi', () => {
    for (const template of TEMPLATE_CATALOG) {
      const criteria = template.resolutionCriteria(mockContext);
      expect(criteria.yes.toLowerCase()).not.toBe(criteria.no.toLowerCase());
    }
  });
  
  it('ogni template dovrebbe avere horizonDaysMin < horizonDaysMax', () => {
    for (const template of TEMPLATE_CATALOG) {
      expect(template.horizonDaysMin).toBeLessThan(template.horizonDaysMax);
    }
  });
});
