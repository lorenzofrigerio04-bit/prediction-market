/**
 * Canonical URL extraction
 * 
 * Extracts canonical URL from article URL:
 * - Checks for <link rel="canonical"> tag
 * - Falls back to normalized URL (removes query params, fragment, trailing slash)
 * - Normalizes: lowercase, remove www, ensure https
 */

import * as cheerio from 'cheerio';

/**
 * Extract canonical URL from a given URL
 * 
 * @param url - The article URL
 * @returns The canonical URL
 */
export async function extractCanonicalUrl(url: string): Promise<string> {
  // Skip fetching for calendar:// URLs (they're already canonical)
  if (url.startsWith('calendar://')) {
    return normalizeUrl(url);
  }

  try {
    // Try to fetch the page and check for canonical tag
    // In development, we may need to disable SSL verification
    const fetchOptions: RequestInit = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IngestionBot/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    };

    // For Node.js fetch, we can't directly disable SSL, but we can catch errors
    const response = await fetch(url, fetchOptions);

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);

      // Check for canonical link tag
      const canonicalTag = $('link[rel="canonical"]').attr('href');
      if (canonicalTag) {
        return normalizeUrl(canonicalTag);
      }
    }
  } catch (error) {
    // If fetching fails, fall back to URL normalization
    console.warn(`Failed to fetch canonical URL for ${url}:`, error);
  }

  // Fallback: normalize the original URL
  return normalizeUrl(url);
}

/**
 * Normalize URL: lowercase, remove www, ensure https, remove query params and fragment
 * Special handling for calendar:// URLs (keep as-is)
 */
function normalizeUrl(url: string): string {
  // Calendar URLs are already canonical - return as-is
  if (url.startsWith('calendar://')) {
    return url.toLowerCase();
  }

  try {
    const urlObj = new URL(url);

    // Normalize protocol to https (unless it's a special protocol like calendar://)
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      // Keep non-HTTP protocols as-is (e.g., calendar://)
      return url.toLowerCase();
    }
    urlObj.protocol = 'https:';

    // Remove www subdomain
    if (urlObj.hostname && urlObj.hostname.startsWith('www.')) {
      urlObj.hostname = urlObj.hostname.substring(4);
    }

    // Remove query params and fragment
    urlObj.search = '';
    urlObj.hash = '';

    // Remove trailing slash
    let pathname = urlObj.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    urlObj.pathname = pathname;

    // Convert to lowercase
    return urlObj.toString().toLowerCase();
  } catch (error) {
    // If URL parsing fails, return original URL (lowercased)
    console.warn(`Failed to normalize URL ${url}:`, error);
    return url.toLowerCase();
  }
}
