/**
 * Unit tests for time coherence validation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  type MarketCategory,
  CATEGORY_BUFFERS,
  DEFAULT_MIN_HOURS_FROM_NOW,
  MAX_HORIZON_DAYS,
  getCategoryBuffer,
  validateTimeCoherence,
  assertTimeCoherence,
} from '../time-coherence';

describe('Time Coherence Validation', () => {
  const now = new Date('2026-02-16T12:00:00Z');
  const realWorldEventTime = new Date('2026-02-20T14:00:00Z');
  const resolutionTimeExpected = new Date('2026-02-20T15:00:00Z');

  describe('getCategoryBuffer', () => {
    it('should return correct buffer for each category', () => {
      expect(getCategoryBuffer('Sport')).toBe(1);
      expect(getCategoryBuffer('News')).toBe(2);
      expect(getCategoryBuffer('Politica')).toBe(2);
      expect(getCategoryBuffer('Economia')).toBe(24);
      expect(getCategoryBuffer('Cultura')).toBe(6);
      expect(getCategoryBuffer('Tecnologia')).toBe(12);
    });
  });

  describe('validateTimeCoherence', () => {
    describe('Rule 1: marketCloseTime <= realWorldEventTime - bufferHours', () => {
      it('should pass when marketCloseTime is exactly bufferHours before realWorldEventTime', () => {
        const marketCloseTime = new Date(realWorldEventTime.getTime() - 1 * 60 * 60 * 1000); // 1h before for Sport
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected,
          category: 'Sport',
          now,
        });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should pass when marketCloseTime is more than bufferHours before realWorldEventTime', () => {
        const marketCloseTime = new Date(realWorldEventTime.getTime() - 2 * 60 * 60 * 1000); // 2h before for Sport
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected,
          category: 'Sport',
          now,
        });
        expect(result.isValid).toBe(true);
      });

      it('should fail when marketCloseTime is less than bufferHours before realWorldEventTime', () => {
        const marketCloseTime = new Date(realWorldEventTime.getTime() - 30 * 60 * 1000); // 30min before for Sport (needs 1h)
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected,
          category: 'Sport',
          now,
        });
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain('Market close time');
      });

      it('should enforce different buffers for different categories', () => {
        // Economia needs 24h buffer
        const marketCloseTime = new Date(realWorldEventTime.getTime() - 12 * 60 * 60 * 1000); // 12h before
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected,
          category: 'Economia',
          now,
        });
        expect(result.isValid).toBe(false);
      });
    });

    describe('Rule 2: resolutionTimeExpected >= realWorldEventTime', () => {
      it('should pass when resolutionTimeExpected equals realWorldEventTime', () => {
        const marketCloseTime = new Date(realWorldEventTime.getTime() - 1 * 60 * 60 * 1000);
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected: realWorldEventTime,
          category: 'Sport',
          now,
        });
        expect(result.isValid).toBe(true);
      });

      it('should pass when resolutionTimeExpected is after realWorldEventTime', () => {
        const marketCloseTime = new Date(realWorldEventTime.getTime() - 1 * 60 * 60 * 1000);
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected: new Date(realWorldEventTime.getTime() + 60 * 60 * 1000),
          category: 'Sport',
          now,
        });
        expect(result.isValid).toBe(true);
      });

      it('should fail when resolutionTimeExpected is before realWorldEventTime', () => {
        const marketCloseTime = new Date(realWorldEventTime.getTime() - 1 * 60 * 60 * 1000);
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected: new Date(realWorldEventTime.getTime() - 60 * 60 * 1000),
          category: 'Sport',
          now,
        });
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('Resolution time expected'))).toBe(true);
      });
    });

    describe('Rule 3: closesAt >= now + minHoursFromNow', () => {
      it('should pass when closesAt is at least minHoursFromNow from now', () => {
        const marketCloseTime = new Date(now.getTime() + DEFAULT_MIN_HOURS_FROM_NOW * 60 * 60 * 1000);
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected,
          category: 'Sport',
          now,
        });
        expect(result.isValid).toBe(true);
      });

      it('should fail when closesAt is less than minHoursFromNow from now', () => {
        const marketCloseTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12h from now (needs 24h)
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected,
          category: 'Sport',
          now,
        });
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('at least') && e.includes('from now'))).toBe(true);
      });

      it('should respect custom minHoursFromNow', () => {
        const marketCloseTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12h from now
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected,
          category: 'Sport',
          now,
          minHoursFromNow: 10, // Custom: 10h
        });
        expect(result.isValid).toBe(true);
      });
    });

    describe('Rule 4: realWorldEventTime <= now + maxHorizonDays', () => {
      it('should pass when realWorldEventTime is within maxHorizonDays', () => {
        const futureEventTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
        const marketCloseTime = new Date(futureEventTime.getTime() - 1 * 60 * 60 * 1000);
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime: futureEventTime,
          resolutionTimeExpected: new Date(futureEventTime.getTime() + 60 * 60 * 1000),
          category: 'Sport',
          now,
        });
        expect(result.isValid).toBe(true);
      });

      it('should fail when realWorldEventTime exceeds maxHorizonDays', () => {
        const futureEventTime = new Date(now.getTime() + (MAX_HORIZON_DAYS + 1) * 24 * 60 * 60 * 1000);
        const marketCloseTime = new Date(futureEventTime.getTime() - 1 * 60 * 60 * 1000);
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime: futureEventTime,
          resolutionTimeExpected: new Date(futureEventTime.getTime() + 60 * 60 * 1000),
          category: 'Sport',
          now,
        });
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('cannot be more than'))).toBe(true);
      });

      it('should respect custom maxHorizonDays', () => {
        const futureEventTime = new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000); // 100 days
        const marketCloseTime = new Date(futureEventTime.getTime() - 1 * 60 * 60 * 1000);
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime: futureEventTime,
          resolutionTimeExpected: new Date(futureEventTime.getTime() + 60 * 60 * 1000),
          category: 'Sport',
          now,
          maxHorizonDays: 90, // Custom: 90 days
        });
        expect(result.isValid).toBe(false);
      });
    });

    describe('Multiple rule violations', () => {
      it('should report all violations', () => {
        const marketCloseTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // Violates minHoursFromNow
        const futureEventTime = new Date(now.getTime() + (MAX_HORIZON_DAYS + 1) * 24 * 60 * 60 * 1000); // Violates maxHorizon
        const result = validateTimeCoherence({
          marketCloseTime,
          realWorldEventTime: futureEventTime,
          resolutionTimeExpected: new Date(futureEventTime.getTime() - 60 * 60 * 1000), // Violates resolutionTime
          category: 'Economia', // Needs 24h buffer
          now,
        });
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
      });
    });
  });

  describe('assertTimeCoherence', () => {
    it('should not throw when validation passes', () => {
      const marketCloseTime = new Date(realWorldEventTime.getTime() - 1 * 60 * 60 * 1000);
      expect(() => {
        assertTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected,
          category: 'Sport',
          now,
        });
      }).not.toThrow();
    });

    it('should throw with error message when validation fails', () => {
      const marketCloseTime = new Date(realWorldEventTime.getTime() - 30 * 60 * 1000); // Too close
      expect(() => {
        assertTimeCoherence({
          marketCloseTime,
          realWorldEventTime,
          resolutionTimeExpected,
          category: 'Sport',
          now,
        });
      }).toThrow('Time coherence validation failed');
    });
  });
});
