/**
 * Unit tests for closesAt computation
 */

import { describe, it, expect } from '@jest/globals';
import {
  computeClosesAt,
  computeClosesAtStrict,
  type ComputeClosesAtParams,
} from '../closes-at';

describe('computeClosesAt', () => {
  const now = new Date('2026-02-16T12:00:00Z');
  const realWorldEventTime = new Date('2026-02-20T14:00:00Z');
  const resolutionTimeExpected = new Date('2026-02-20T15:00:00Z');

  describe('Basic computation', () => {
    it('should compute closesAt as realWorldEventTime - buffer for Sport (1h)', () => {
      const result = computeClosesAt({
        realWorldEventTime,
        resolutionTimeExpected,
        category: 'Sport',
        now,
      });
      
      const expectedClosesAt = new Date(realWorldEventTime.getTime() - 1 * 60 * 60 * 1000);
      expect(result.closesAt.getTime()).toBe(expectedClosesAt.getTime());
    });

    it('should compute closesAt as realWorldEventTime - buffer for Economia (24h)', () => {
      const result = computeClosesAt({
        realWorldEventTime,
        resolutionTimeExpected,
        category: 'Economia',
        now,
      });
      
      const expectedClosesAt = new Date(realWorldEventTime.getTime() - 24 * 60 * 60 * 1000);
      expect(result.closesAt.getTime()).toBe(expectedClosesAt.getTime());
    });

    it('should compute closesAt as realWorldEventTime - buffer for Tecnologia (12h)', () => {
      const result = computeClosesAt({
        realWorldEventTime,
        resolutionTimeExpected,
        category: 'Tecnologia',
        now,
      });
      
      const expectedClosesAt = new Date(realWorldEventTime.getTime() - 12 * 60 * 60 * 1000);
      expect(result.closesAt.getTime()).toBe(expectedClosesAt.getTime());
    });
  });

  describe('Minimum hours from now enforcement', () => {
    it('should adjust closesAt to now + minHoursFromNow if calculated value is too early', () => {
      // realWorldEventTime is only 2h from now, but Sport needs 1h buffer
      // So calculated closesAt would be 1h from now, but minHoursFromNow is 24h
      const nearFutureEventTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2h from now
      const result = computeClosesAt({
        realWorldEventTime: nearFutureEventTime,
        resolutionTimeExpected: new Date(nearFutureEventTime.getTime() + 60 * 60 * 1000),
        category: 'Sport',
        now,
      });

      const minCloseTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      expect(result.closesAt.getTime()).toBe(minCloseTime.getTime());
      // Should be invalid because it violates time coherence
      expect(result.isValid).toBe(false);
    });

    it('should use calculated closesAt when it satisfies minHoursFromNow', () => {
      const result = computeClosesAt({
        realWorldEventTime,
        resolutionTimeExpected,
        category: 'Sport',
        now,
      });

      const expectedClosesAt = new Date(realWorldEventTime.getTime() - 1 * 60 * 60 * 1000);
      expect(result.closesAt.getTime()).toBe(expectedClosesAt.getTime());
    });
  });

  describe('Validation integration', () => {
    it('should return isValid=true when all rules are satisfied', () => {
      const result = computeClosesAt({
        realWorldEventTime,
        resolutionTimeExpected,
        category: 'Sport',
        now,
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return isValid=false with errors when rules are violated', () => {
      const tooFarFutureEventTime = new Date(now.getTime() + (730 + 1) * 24 * 60 * 60 * 1000);
      const result = computeClosesAt({
        realWorldEventTime: tooFarFutureEventTime,
        resolutionTimeExpected: new Date(tooFarFutureEventTime.getTime() + 60 * 60 * 1000),
        category: 'Sport',
        now,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('computeClosesAtStrict', () => {
    it('should return closesAt when validation passes', () => {
      const closesAt = computeClosesAtStrict({
        realWorldEventTime,
        resolutionTimeExpected,
        category: 'Sport',
        now,
      });
      expect(closesAt).toBeInstanceOf(Date);
      expect(closesAt.getTime()).toBe(new Date(realWorldEventTime.getTime() - 1 * 60 * 60 * 1000).getTime());
    });

    it('should throw when validation fails', () => {
      const tooFarFutureEventTime = new Date(now.getTime() + (730 + 1) * 24 * 60 * 60 * 1000);
      expect(() => {
        computeClosesAtStrict({
          realWorldEventTime: tooFarFutureEventTime,
          resolutionTimeExpected: new Date(tooFarFutureEventTime.getTime() + 60 * 60 * 1000),
          category: 'Sport',
          now,
        });
      }).toThrow('Cannot compute valid closesAt');
    });
  });

  describe('Custom parameters', () => {
    it('should respect custom minHoursFromNow', () => {
      const nearFutureEventTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const result = computeClosesAt({
        realWorldEventTime: nearFutureEventTime,
        resolutionTimeExpected: new Date(nearFutureEventTime.getTime() + 60 * 60 * 1000),
        category: 'Sport',
        now,
        minHoursFromNow: 1, // Custom: 1h instead of 24h
      });

      const expectedClosesAt = new Date(nearFutureEventTime.getTime() - 1 * 60 * 60 * 1000);
      expect(result.closesAt.getTime()).toBe(expectedClosesAt.getTime());
    });

    it('should respect custom maxHorizonDays', () => {
      const futureEventTime = new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000);
      const result = computeClosesAt({
        realWorldEventTime: futureEventTime,
        resolutionTimeExpected: new Date(futureEventTime.getTime() + 60 * 60 * 1000),
        category: 'Sport',
        now,
        maxHorizonDays: 90, // Custom: 90 days
      });
      expect(result.isValid).toBe(false);
    });
  });
});
