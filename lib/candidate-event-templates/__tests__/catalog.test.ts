/**
 * Unit tests: Template catalog - template selection by category
 */

import { describe, it, expect } from 'vitest';
import {
  getTemplateCategory,
  getTemplatesForCategory,
  getTemplateById,
  getAllTemplates,
} from '../catalog';
import type { TemplateContext } from '../types';

const mockContext: TemplateContext = {
  subject_entity: 'Bitcoin',
  threshold: 100000,
  deadline: new Date('2025-12-31'),
  topic: 'Bitcoin 100k',
  entities: ['Bitcoin'],
  trend: {} as TemplateContext['trend'],
};

describe('getTemplateCategory', () => {
  it('maps Crypto to Crypto', () => {
    expect(getTemplateCategory('Crypto')).toBe('Crypto');
  });
  it('maps Sport to Sport', () => {
    expect(getTemplateCategory('Sport')).toBe('Sport');
  });
  it('maps Politica to Politica', () => {
    expect(getTemplateCategory('Politica')).toBe('Politica');
  });
  it('maps Tecnologia to Tecnologia', () => {
    expect(getTemplateCategory('Tecnologia')).toBe('Tecnologia');
  });
  it('maps Economia to Economia', () => {
    expect(getTemplateCategory('Economia')).toBe('Economia');
  });
  it('maps Cultura to Cultura', () => {
    expect(getTemplateCategory('Cultura')).toBe('Cultura');
  });
  it('maps Altro to Intrattenimento', () => {
    expect(getTemplateCategory('Altro')).toBe('Intrattenimento');
  });
});

describe('getTemplatesForCategory', () => {
  it('returns templates for Crypto', () => {
    const templates = getTemplatesForCategory('Crypto');
    expect(templates.length).toBeGreaterThanOrEqual(1);
    expect(templates.every((t) => t.category === 'Crypto')).toBe(true);
  });
  it('returns max 3 templates per category', () => {
    const templates = getTemplatesForCategory('Sport');
    expect(templates.length).toBeLessThanOrEqual(3);
  });
});

describe('getTemplateById', () => {
  it('finds crypto-price-threshold', () => {
    const t = getTemplateById('crypto-price-threshold');
    expect(t).toBeDefined();
    expect(t?.id).toBe('crypto-price-threshold');
  });
  it('returns null for unknown id', () => {
    expect(getTemplateById('unknown-template')).toBeNull();
  });
});

describe('getAllTemplates', () => {
  it('returns all templates', () => {
    const all = getAllTemplates();
    expect(all.length).toBeGreaterThan(5);
  });
});

describe('Template output', () => {
  it('each template produces question ending with ?', () => {
    const all = getAllTemplates();
    for (const t of all) {
      const ctx = { ...mockContext, subject_entity: 'Test', threshold: 100 };
      const q = t.question(ctx);
      expect(q).toMatch(/\?$/);
    }
  });
  it('each template produces non-empty resolution criteria', () => {
    const all = getAllTemplates();
    for (const t of all) {
      const ctx = { ...mockContext, subject_entity: 'Test', threshold: 100 };
      const c = t.resolutionCriteria(ctx);
      expect(c.yes.trim().length).toBeGreaterThan(0);
      expect(c.no.trim().length).toBeGreaterThan(0);
    }
  });
});
