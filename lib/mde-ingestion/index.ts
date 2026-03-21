/**
 * MDE ingestion bridge: app ingestion (SourceArticle / ProcessedArticle)
 * → foundation-layer SourceObservation for the Market Design Engine pipeline.
 */

export {
  articleToSourceObservation,
  toObservationNormalizationResult,
  type ArticleToObservationInput,
} from "./article-to-observation";
