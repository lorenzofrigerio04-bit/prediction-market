/**
 * Jaccard clustering
 * 
 * Clusters articles based on Jaccard similarity of their tokenized text.
 * Jaccard similarity: J(A,B) = |A ∩ B| / |A ∪ B|
 */

import { prisma } from '@/lib/prisma';
import type { ProcessedArticle } from '../types';

const JACCARD_THRESHOLD =
  parseFloat(process.env.JACCARD_THRESHOLD || '0.5') || 0.5;

/**
 * Tokenize text into a set of words
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter((word) => word.length > 2) // Filter out very short words
  );
}

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set(Array.from(setA).filter((x) => setB.has(x)));
  const union = new Set([...Array.from(setA), ...Array.from(setB)]);

  if (union.size === 0) {
    return 0;
  }

  return intersection.size / union.size;
}

/**
 * Cluster an article by finding similar articles and assigning to cluster
 * 
 * @param article - The article to cluster
 * @returns The cluster ID if a similar article is found, null otherwise
 */
export async function clusterArticle(
  article: ProcessedArticle
): Promise<string | null> {
  // Tokenize the article text (title + content)
  const articleText = `${article.title} ${article.content || ''}`;
  const articleTokens = tokenize(articleText);

  if (articleTokens.size === 0) {
    return null; // No tokens to compare
  }

  // Get all existing articles with clusters (to find similar ones)
  const existingArticles = await prisma.sourceArticle.findMany({
    where: {
      clusterId: { not: null },
    },
    include: {
      cluster: true,
    },
    take: 1000, // Limit to avoid performance issues
  });

  let bestMatch: { clusterId: string; similarity: number } | null = null;

  // Check similarity with existing articles
  for (const existing of existingArticles) {
    const existingText = `${existing.title} ${existing.content || ''}`;
    const existingTokens = tokenize(existingText);

    const similarity = jaccardSimilarity(articleTokens, existingTokens);

    if (
      similarity >= JACCARD_THRESHOLD &&
      (!bestMatch || similarity > bestMatch.similarity)
    ) {
      bestMatch = {
        clusterId: existing.clusterId!,
        similarity,
      };
    }
  }

  if (bestMatch) {
    // Add article to existing cluster
    return bestMatch.clusterId;
  }

  // No similar article found, create new cluster
  const newCluster = await prisma.sourceCluster.create({
    data: {
      jaccardScore: 0, // Will be updated when we calculate average
      articleCount: 1,
    },
  });

  return newCluster.id;
}
