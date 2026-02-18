import { describe, it, expect } from 'vitest';
import { determineAuthority } from '../authority';
import type { SourceSignalLite, AuthorityResult } from '../types';

describe('determineAuthority', () => {
  it('returns OFFICIAL when signal has RSS_OFFICIAL sourceType and official host', () => {
    const signals: SourceSignalLite[] = [
      {
        id: '1',
        title: 'Official Signal',
        publishedAt: new Date('2024-01-01T12:00:00Z'),
        host: 'governo.it',
        sourceType: 'RSS_OFFICIAL',
      },
    ];
    
    const authority = determineAuthority(signals);
    
    expect(authority).not.toBeNull();
    expect(authority!.type).toBe('OFFICIAL');
    expect(authority!.host).toBe('governo.it');
  });
  
  it('returns OFFICIAL when signal has CALENDAR sourceType and official host', () => {
    const signals: SourceSignalLite[] = [
      {
        id: '1',
        title: 'Calendar Signal',
        publishedAt: new Date('2024-01-01T12:00:00Z'),
        host: 'uefa.com',
        sourceType: 'CALENDAR_SPORT',
      },
    ];
    
    const authority = determineAuthority(signals);
    
    expect(authority).not.toBeNull();
    expect(authority!.type).toBe('OFFICIAL');
    expect(authority!.host).toBe('uefa.com');
  });
  
  it('returns REPUTABLE when signal has reputable host but not official sourceType', () => {
    const signals: SourceSignalLite[] = [
      {
        id: '1',
        title: 'Reputable Signal',
        publishedAt: new Date('2024-01-01T12:00:00Z'),
        host: 'reuters.com',
        sourceType: 'RSS_MEDIA', // Not RSS_OFFICIAL or CALENDAR
      },
    ];
    
    const authority = determineAuthority(signals);
    
    expect(authority).not.toBeNull();
    expect(authority!.type).toBe('REPUTABLE');
    expect(authority!.host).toBe('reuters.com');
  });
  
  it('returns null when no authority found', () => {
    const signals: SourceSignalLite[] = [
      {
        id: '1',
        title: 'Unknown Signal',
        publishedAt: new Date('2024-01-01T12:00:00Z'),
        host: 'unknown-blog.com',
        sourceType: 'RSS_MEDIA',
      },
    ];
    
    const authority = determineAuthority(signals);
    
    expect(authority).toBeNull();
  });
  
  it('OFFICIAL beats REPUTABLE when both present', () => {
    const signals: SourceSignalLite[] = [
      {
        id: '1',
        title: 'Reputable Signal',
        publishedAt: new Date('2024-01-01T12:00:00Z'),
        host: 'reuters.com',
        sourceType: 'RSS_MEDIA',
      },
      {
        id: '2',
        title: 'Official Signal',
        publishedAt: new Date('2024-01-01T13:00:00Z'),
        host: 'governo.it',
        sourceType: 'RSS_OFFICIAL',
      },
    ];
    
    const authority = determineAuthority(signals);
    
    expect(authority).not.toBeNull();
    expect(authority!.type).toBe('OFFICIAL');
    expect(authority!.host).toBe('governo.it');
  });
  
  it('chooses host with highest count when multiple official hosts', () => {
    const signals: SourceSignalLite[] = [
      {
        id: '1',
        title: 'Signal 1',
        publishedAt: new Date('2024-01-01T12:00:00Z'),
        host: 'governo.it',
        sourceType: 'RSS_OFFICIAL',
      },
      {
        id: '2',
        title: 'Signal 2',
        publishedAt: new Date('2024-01-01T13:00:00Z'),
        host: 'governo.it',
        sourceType: 'RSS_OFFICIAL',
      },
      {
        id: '3',
        title: 'Signal 3',
        publishedAt: new Date('2024-01-01T14:00:00Z'),
        host: 'salute.gov.it',
        sourceType: 'RSS_OFFICIAL',
      },
    ];
    
    const authority = determineAuthority(signals);
    
    expect(authority).not.toBeNull();
    expect(authority!.type).toBe('OFFICIAL');
    // governo.it has count 2, salute.gov.it has count 1
    expect(authority!.host).toBe('governo.it');
  });
  
  it('uses most recent as tie-breaker when counts are equal', () => {
    const signals: SourceSignalLite[] = [
      {
        id: '1',
        title: 'Signal 1',
        publishedAt: new Date('2024-01-01T12:00:00Z'),
        host: 'governo.it',
        sourceType: 'RSS_OFFICIAL',
      },
      {
        id: '2',
        title: 'Signal 2',
        publishedAt: new Date('2024-01-01T14:00:00Z'), // More recent
        host: 'salute.gov.it',
        sourceType: 'RSS_OFFICIAL',
      },
    ];
    
    const authority = determineAuthority(signals);
    
    expect(authority).not.toBeNull();
    expect(authority!.type).toBe('OFFICIAL');
    // Both have count 1, but salute.gov.it is more recent
    expect(authority!.host).toBe('salute.gov.it');
  });
  
  it('handles www prefix correctly', () => {
    const signals: SourceSignalLite[] = [
      {
        id: '1',
        title: 'Signal',
        publishedAt: new Date('2024-01-01T12:00:00Z'),
        host: 'https://www.governo.it/article', // URL with www
        sourceType: 'RSS_OFFICIAL',
      },
    ];
    
    const authority = determineAuthority(signals);
    
    expect(authority).not.toBeNull();
    expect(authority!.type).toBe('OFFICIAL');
    // Should extract hostname correctly
    expect(authority!.host).toBe('governo.it');
  });
});
