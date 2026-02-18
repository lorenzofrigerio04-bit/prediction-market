/**
 * Test: Event Verifier
 * BLOCCO 4: Verifica regole HARD FAIL
 */

import { verifyCandidate } from '../verify';
import type { GeneratedEventCandidate } from '../../event-generation-v2/types';

describe('Event Verifier', () => {
  const now = new Date('2025-01-01T12:00:00Z');
  const validClosesAt = new Date('2025-01-15T12:00:00Z');
  const expectedHost = 'governo.it';
  
  const createValidCandidate = (): GeneratedEventCandidate => ({
    title: 'Sarà pubblicato un comunicato ufficiale?',
    description: 'Test description',
    category: 'Politica',
    closesAt: validClosesAt,
    resolutionAuthorityHost: 'governo.it',
    resolutionAuthorityType: 'OFFICIAL',
    resolutionCriteria: {
      yes: 'Comunicato pubblicato',
      no: 'Nessun comunicato pubblicato',
    },
    sourceStorylineId: 'test-123',
    templateId: 'test-template',
  });
  
  it('dovrebbe approvare un candidate valido', () => {
    const candidate = createValidCandidate();
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(true);
  });
  
  it('dovrebbe bocciare titolo senza "?"', () => {
    const candidate = createValidCandidate();
    candidate.title = 'Sarà pubblicato un comunicato ufficiale';
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain(expect.stringContaining('deve terminare con "?"'));
  });
  
  it('dovrebbe bocciare titolo con " e "', () => {
    const candidate = createValidCandidate();
    candidate.title = 'Sarà pubblicato un comunicato e una delibera?';
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain(expect.stringContaining('più condizioni'));
  });
  
  it('dovrebbe bocciare titolo con " oppure "', () => {
    const candidate = createValidCandidate();
    candidate.title = 'Sarà pubblicato un comunicato oppure una delibera?';
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain(expect.stringContaining('più condizioni'));
  });
  
  it('dovrebbe bocciare titolo con ";"', () => {
    const candidate = createValidCandidate();
    candidate.title = 'Sarà pubblicato un comunicato; sarà pubblicata una delibera?';
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain(expect.stringContaining('più condizioni'));
  });
  
  it('dovrebbe bocciare titolo con parole vaghe', () => {
    const candidate = createValidCandidate();
    candidate.title = 'Sarà probabile un comunicato importante?';
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons.some((r) => r.includes('parole vaghe'))).toBe(true);
  });
  
  it('dovrebbe bocciare resolutionCriteria.yes vuoto', () => {
    const candidate = createValidCandidate();
    candidate.resolutionCriteria.yes = '';
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain(expect.stringContaining('yes non può essere vuoto'));
  });
  
  it('dovrebbe bocciare resolutionCriteria.no vuoto', () => {
    const candidate = createValidCandidate();
    candidate.resolutionCriteria.no = '';
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain(expect.stringContaining('no non può essere vuoto'));
  });
  
  it('dovrebbe bocciare resolutionCriteria identici', () => {
    const candidate = createValidCandidate();
    candidate.resolutionCriteria.yes = 'Stesso testo';
    candidate.resolutionCriteria.no = 'Stesso testo';
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain(expect.stringContaining('mutuamente esclusivi'));
  });
  
  it('dovrebbe bocciare closesAt < now + 30min', () => {
    const candidate = createValidCandidate();
    candidate.closesAt = new Date(now.getTime() + 15 * 60 * 1000); // +15 minuti
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain(expect.stringContaining('almeno 30 minuti'));
  });
  
  it('dovrebbe bocciare closesAt > now + 365 giorni', () => {
    const candidate = createValidCandidate();
    candidate.closesAt = new Date(now.getTime() + 366 * 24 * 60 * 60 * 1000); // +366 giorni
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain(expect.stringContaining('365 giorni'));
  });
  
  it('dovrebbe bocciare authority host mismatch', () => {
    const candidate = createValidCandidate();
    candidate.resolutionAuthorityHost = 'example.com';
    const result = verifyCandidate(candidate, now, expectedHost);
    expect(result.ok).toBe(false);
    expect(result.reasons.some((r) => r.includes('non matcha'))).toBe(true);
  });
});
