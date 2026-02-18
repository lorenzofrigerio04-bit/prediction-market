/**
 * Deduplication logic
 * 
 * Checks for duplicate articles by canonical URL in the database.
 */

import { prisma } from '@/lib/prisma';

/**
 * Check if an article with the given canonical URL already exists
 * 
 * @param canonicalUrl - The canonical URL to check
 * @returns The existing article if found, null otherwise
 */
export async function checkDuplicate(
  canonicalUrl: string
): Promise<{ id: string } | null> {
  const existing = await prisma.sourceArticle.findUnique({
    where: { canonicalUrl },
    select: { id: true },
  });

  return existing;
}

/**
 * Check if a canonical URL is a duplicate (convenience function)
 * 
 * @param canonicalUrl - The canonical URL to check
 * @returns true if duplicate exists, false otherwise
 */
export async function isDuplicate(canonicalUrl: string): Promise<boolean> {
  const existing = await checkDuplicate(canonicalUrl);
  return existing !== null;
}
