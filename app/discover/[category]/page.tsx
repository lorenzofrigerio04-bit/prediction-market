"use client";

import Header from "@/components/Header";
import { HomeUnifiedFeed } from "@/components/home/HomeUnifiedFeed";
import { useParams } from "next/navigation";
import { getCategoryNameFromSlug } from "@/lib/category-slug";

function buildCategoryFeedConfig(slug: string) {
  if (slug === "tutti" || slug === "") {
    return {
      pageLabel: "Tendenza",
      endpoint: "/api/feed/home-unified?sort=popular",
      featuredTitle: "Top 5 eventi delle ultime 24h",
      feedTitle: "Eventi popolari",
    };
  }

  const categoryLabel = getCategoryNameFromSlug(slug) ?? "Categoria";
  return {
    pageLabel: categoryLabel,
    endpoint: `/api/feed/home-unified?categorySlug=${encodeURIComponent(slug)}`,
    featuredTitle: `Top ${categoryLabel} delle ultime 24h`,
    feedTitle: `Eventi ${categoryLabel}`,
  };
}

export default function DiscoverCategoryPage() {
  const params = useParams();
  const slug = typeof params.category === "string" ? params.category : "";
  const { pageLabel, endpoint, featuredTitle, feedTitle } = buildCategoryFeedConfig(slug);

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-6xl">
        <div className="pt-4 sm:pt-5 px-4 sm:px-6 max-w-2xl mx-auto">
          <p className="mb-3 text-ds-caption font-medium uppercase tracking-[0.08em] text-fg-muted">
            {pageLabel}
          </p>
          <HomeUnifiedFeed
            endpoint={endpoint}
            featuredTitle={featuredTitle}
            feedTitle={feedTitle}
            emptyTitle={`Nessun evento in ${pageLabel}`}
            emptyDescription="Al momento non ci sono mercati aperti in questa categoria."
            layout="classic"
          />
        </div>
      </main>
    </div>
  );
}
