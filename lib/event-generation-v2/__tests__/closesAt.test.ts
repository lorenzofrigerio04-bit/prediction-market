/**
 * Test: ClosesAt Deterministico
 * BLOCCO 4: Verifica calcolo closesAt
 */

import { computeClosesAt } from '../closesAt';

describe('computeClosesAt', () => {
  const now = new Date('2025-01-01T12:00:00Z');
  
  it('dovrebbe usare horizonDaysMin per momentum alto (>0.7)', () => {
    const closesAt = computeClosesAt(7, 30, 0.8, now);
    const expectedMin = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expectedMax = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
    expect(closesAt.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
    expect(closesAt.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
  });
  
  it('dovrebbe usare horizonDaysMax per momentum medio/basso', () => {
    const closesAt = computeClosesAt(7, 30, 0.5, now);
    const expectedMin = new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000);
    const expectedMax = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);
    expect(closesAt.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
    expect(closesAt.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
  });
  
  it('dovrebbe clampare a minimo now + 30min', () => {
    const closesAt = computeClosesAt(0, 0, 0.5, now);
    const minClose = new Date(now.getTime() + 30 * 60 * 1000);
    expect(closesAt.getTime()).toBeGreaterThanOrEqual(minClose.getTime());
  });
  
  it('dovrebbe clampare a massimo now + 365 giorni', () => {
    const closesAt = computeClosesAt(400, 500, 0.5, now);
    const maxClose = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    expect(closesAt.getTime()).toBeLessThanOrEqual(maxClose.getTime());
  });
  
  it('dovrebbe arrotondare a HH:00 UTC', () => {
    const closesAt = computeClosesAt(1, 1, 0.5, now);
    expect(closesAt.getUTCMinutes()).toBe(0);
    expect(closesAt.getUTCSeconds()).toBe(0);
    expect(closesAt.getUTCMilliseconds()).toBe(0);
  });
});
