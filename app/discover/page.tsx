"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import CategoryBoxes from "@/components/discover/CategoryBoxes";
import {
  PageHeader,
  EmptyState,
  LoadingBlock,
} from "@/components/ui";

export default function DiscoverPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        setCategories([]);
      }
    } catch {
      setError("Impossibile caricare le categorie.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-6xl">
        <PageHeader
          title="Eventi"
          description="Scegli una categoria per esplorare gli eventi e fare le tue previsioni."
        />

        {error ? (
          <EmptyState
            title="Errore"
            description={error}
            action={{ label: "Riprova", onClick: () => fetchCategories() }}
          />
        ) : loading ? (
          <div className="py-12">
            <LoadingBlock message="Caricamento categorie..." />
          </div>
        ) : (
          <section aria-label="Categorie eventi" className="space-y-6">
            <h2 className="text-ds-body font-semibold text-fg-muted">
              Scegli una categoria
            </h2>
            <CategoryBoxes categories={categories} showTutti />
          </section>
        )}
      </main>
    </div>
  );
}
