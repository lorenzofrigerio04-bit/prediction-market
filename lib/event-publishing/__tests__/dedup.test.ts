/**
 * Test unitari per deduplicazione
 */

import { describe, it, expect } from 'vitest';
import { normalizeText, generateDedupKey, dedupIntraRun } from '../dedup';
import type { ScoredCandidate } from '../types';

describe('dedup', () => {
  describe('normalizeText', () => {
    it('should normalize text correctly', () => {
      expect(normalizeText('  Test   Title  ')).toBe('test title');
      expect(normalizeText('Test, Title!')).toBe('test title');
      expect(normalizeText('Test    Multiple    Spaces')).toBe('test multiple spaces');
    });

    it('should be stable for similar inputs', () => {
      const text1 = normalizeText('Test Title');
      const text2 = normalizeText('test title');
      const text3 = normalizeText('Test, Title!');
      
      expect(text1).toBe(text2);
      expect(text1).toBe(text3);
    });
  });

  describe('generateDedupKey', () => {
    it('should generate same key for identical inputs', () => {
      const date = new Date('2025-12-31');
      const key1 = generateDedupKey('Test Title', date, 'www.example.com');
      const key2 = generateDedupKey('Test Title', date, 'www.example.com');
      
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different titles', () => {
      const date = new Date('2025-12-31');
      const key1 = generateDedupKey('Title 1', date, 'www.example.com');
      const key2 = generateDedupKey('Title 2', date, 'www.example.com');
      
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different dates', () => {
      const date1 = new Date('2025-12-31');
      const date2 = new Date('2026-01-01');
      const key1 = generateDedupKey('Test Title', date1, 'www.example.com');
      const key2 = generateDedupKey('Test Title', date2, 'www.example.com');
      
      expect(key1).not.toBe(key2);
    });

    it('should generate same key for normalized titles', () => {
      const date = new Date('2025-12-31');
      const key1 = generateDedupKey('Test Title', date, 'www.example.com');
      const key2 = generateDedupKey('test title', date, 'www.example.com');
      const key3 = generateDedupKey('Test, Title!', date, 'www.example.com');
      
      expect(key1).toBe(key2);
      expect(key1).toBe(key3);
    });
  });

  describe('dedupIntraRun', () => {
    it('should keep candidate with higher score when duplicates exist', () => {
      const date = new Date('2025-12-31');
      const candidates: ScoredCandidate[] = [
        {
          title: 'Test Title',
          description: 'Desc',
          category: 'Tech',
          closesAt: date,
          resolutionAuthorityHost: 'www.example.com',
          resolutionAuthorityType: 'OFFICIAL',
          resolutionCriteriaYes: 'Yes',
          resolutionCriteriaNo: 'No',
          sourceStorylineId: 's1',
          templateId: 't1',
          score: 50,
          scoreBreakdown: { momentum: 50, novelty: 50, authority: 50, clarity: 50 },
        },
        {
          title: 'test title', // stesso dopo normalizzazione
          description: 'Desc',
          category: 'Tech',
          closesAt: date,
          resolutionAuthorityHost: 'www.example.com',
          resolutionAuthorityType: 'OFFICIAL',
          resolutionCriteriaYes: 'Yes',
          resolutionCriteriaNo: 'No',
          sourceStorylineId: 's1',
          templateId: 't1',
          score: 80, // score maggiore
          scoreBreakdown: { momentum: 80, novelty: 80, authority: 80, clarity: 80 },
        },
      ];

      const deduped = dedupIntraRun(candidates);
      expect(deduped).toHaveLength(1);
      expect(deduped[0].score).toBe(80);
    });

    it('should keep all unique candidates', () => {
      const date = new Date('2025-12-31');
      const candidates: ScoredCandidate[] = [
        {
          title: 'Title 1',
          description: 'Desc',
          category: 'Tech',
          closesAt: date,
          resolutionAuthorityHost: 'www.example.com',
          resolutionAuthorityType: 'OFFICIAL',
          resolutionCriteriaYes: 'Yes',
          resolutionCriteriaNo: 'No',
          sourceStorylineId: 's1',
          templateId: 't1',
          score: 50,
          scoreBreakdown: { momentum: 50, novelty: 50, authority: 50, clarity: 50 },
        },
        {
          title: 'Title 2',
          description: 'Desc',
          category: 'Tech',
          closesAt: date,
          resolutionAuthorityHost: 'www.example.com',
          resolutionAuthorityType: 'OFFICIAL',
          resolutionCriteriaYes: 'Yes',
          resolutionCriteriaNo: 'No',
          sourceStorylineId: 's2',
          templateId: 't2',
          score: 60,
          scoreBreakdown: { momentum: 60, novelty: 60, authority: 60, clarity: 60 },
        },
      ];

      const deduped = dedupIntraRun(candidates);
      expect(deduped).toHaveLength(2);
    });
  });
});
