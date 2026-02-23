"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import CreateEventModal from "@/components/discover/CreateEventModal";
import EventiPrevistiTab from "@/components/discover/EventiPrevistiTab";
import ConsigliatiFeed from "@/components/discover/ConsigliatiFeed";

type DiscoverTab = "per-te" | "seguiti";

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") === "seguiti" ? "seguiti" : "per-te";
  const [activeTab, setActiveTab] = useState<DiscoverTab>(tabFromUrl);

  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Sync tab with URL
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const scrollToTop = useCallback(() => {
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleTornaATuttiGliEventi = useCallback(() => {
    setActiveTab("per-te");
    window.history.replaceState(null, "", "/discover");
    setTimeout(scrollToTop, 100);
  }, [scrollToTop]);

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

  const setTab = (tab: DiscoverTab) => {
    setActiveTab(tab);
    const url = tab === "seguiti" ? "/discover?tab=seguiti" : "/discover";
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden discover-page">
      <Header />

      {/* Tab bar: Seguiti | Consigliati (feed verticale stile TikTok) */}
      <div className="sticky top-[var(--header-height,3.5rem)] z-30 bg-bg/95 backdrop-blur border-b border-white/10">
        <div className="mx-auto px-4 max-w-2xl">
          <div className="flex">
            <button
              type="button"
              onClick={() => setTab("seguiti")}
              className={`flex-1 py-3.5 text-center text-sm font-semibold transition-colors ${
                activeTab === "seguiti"
                  ? "text-primary border-b-2 border-primary"
                  : "text-fg-muted hover:text-fg border-b-2 border-transparent"
              }`}
            >
              Seguiti
            </button>
            <button
              type="button"
              onClick={() => setTab("per-te")}
              className={`flex-1 py-3.5 text-center text-sm font-semibold transition-colors ${
                activeTab === "per-te"
                  ? "text-primary border-b-2 border-primary"
                  : "text-fg-muted hover:text-fg border-b-2 border-transparent"
              }`}
            >
              Consigliati
            </button>
          </div>
        </div>
      </div>

      {activeTab === "per-te" ? (
        <main
          id="main-content"
          className="relative w-full flex flex-col"
          style={
            {
              ["--consigliati-feed-height" as string]:
                "calc(100dvh - var(--header-height, 3.5rem) - 52px)",
            } as React.CSSProperties
          }
        >
          <ConsigliatiFeed />
        </main>
      ) : (
        <main
          ref={mainRef}
          id="main-content"
          className="relative mx-auto px-4 sm:px-6 py-5 md:py-8 max-w-2xl"
        >
          <EventiPrevistiTab
            onTornaATuttiGliEventi={handleTornaATuttiGliEventi}
            categoriesFromPerTe={categories}
          />
        </main>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
