/**
 * Determine authority for a storyline
 * Returns OFFICIAL, REPUTABLE, or null (not eligible)
 */

import { officialHosts, reputableHosts } from '../authority';
import type { SourceSignalLite, AuthorityResult } from './types';

/**
 * Extract hostname from a URL or hostname string (normalized: lowercase, no www)
 */
function extractHost(hostOrUrl: string): string {
  // If it's already a hostname (no protocol), normalize it
  if (!hostOrUrl.includes('://')) {
    let hostname = hostOrUrl.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    return hostname;
  }
  
  // If it's a URL, extract hostname
  try {
    const url = new URL(hostOrUrl);
    let hostname = url.hostname.toLowerCase();
    // Remove www prefix
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    return hostname;
  } catch {
    // If URL parsing fails, try to extract hostname manually
    const match = hostOrUrl.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    if (match) {
      return match[1].toLowerCase();
    }
    return hostOrUrl.toLowerCase();
  }
}

/**
 * Determine authority for a storyline
 * 
 * Rules:
 * 1. OFFICIAL: at least 1 signal with sourceType in {RSS_OFFICIAL, CALENDAR} AND host in officialHosts
 * 2. REPUTABLE: at least 1 signal with host in reputableHosts
 * 3. OFFICIAL beats REPUTABLE
 * 4. If multiple hosts match: choose one with highest count, tie-breaker = most recent
 * 5. If no authority found: return null (not eligible)
 */
export function determineAuthority(
  signals: SourceSignalLite[]
): AuthorityResult {
  // Group signals by host and count occurrences
  const hostCounts = new Map<string, { count: number; mostRecent: Date }>();
  
  for (const signal of signals) {
    const host = extractHost(signal.host);
    const existing = hostCounts.get(host);
    
    if (existing) {
      existing.count++;
      if (signal.publishedAt > existing.mostRecent) {
        existing.mostRecent = signal.publishedAt;
      }
    } else {
      hostCounts.set(host, {
        count: 1,
        mostRecent: signal.publishedAt,
      });
    }
  }

  // Check for OFFICIAL authority
  const officialCandidates: Array<{ host: string; count: number; mostRecent: Date }> = [];
  
  for (const signal of signals) {
    const host = extractHost(signal.host);
    const isOfficialSource = 
      signal.sourceType === 'RSS_OFFICIAL' || 
      signal.sourceType === 'CALENDAR_SPORT' || 
      signal.sourceType === 'CALENDAR_EARNINGS';
    const isOfficialHost = officialHosts.includes(host);
    
    if (isOfficialSource && isOfficialHost) {
      const hostData = hostCounts.get(host)!;
      officialCandidates.push({
        host,
        count: hostData.count,
        mostRecent: hostData.mostRecent,
      });
    }
  }

  if (officialCandidates.length > 0) {
    // Sort by count (desc), then by mostRecent (desc)
    officialCandidates.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return b.mostRecent.getTime() - a.mostRecent.getTime();
    });
    
    return {
      type: 'OFFICIAL',
      host: officialCandidates[0].host,
    };
  }

  // Check for REPUTABLE authority
  const reputableCandidates: Array<{ host: string; count: number; mostRecent: Date }> = [];
  
  for (const signal of signals) {
    const host = extractHost(signal.host);
    if (reputableHosts.includes(host)) {
      const hostData = hostCounts.get(host)!;
      reputableCandidates.push({
        host,
        count: hostData.count,
        mostRecent: hostData.mostRecent,
      });
    }
  }

  if (reputableCandidates.length > 0) {
    // Sort by count (desc), then by mostRecent (desc)
    reputableCandidates.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return b.mostRecent.getTime() - a.mostRecent.getTime();
    });
    
    return {
      type: 'REPUTABLE',
      host: reputableCandidates[0].host,
    };
  }

  // No authority found
  return null;
}
