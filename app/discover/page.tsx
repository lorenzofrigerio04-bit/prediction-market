"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
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
  const mainRef = useRef<HTMLElement>(null);

  // Sync tab with URL
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // Header, tab bar e strip trasparenti + theme-color scuro (status bar) quando Consigliati.
  // useLayoutEffect così le classi sono applicate prima del paint: niente sformattamento tornando da home/altre pagine.
  useLayoutEffect(() => {
    const defaultThemeColor = "#161a26";
    const consigliatiThemeColor = "#0d0e14";
    if (activeTab === "per-te") {
      document.body.classList.add("discover-consigliati-active");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", consigliatiThemeColor);
    } else {
      document.body.classList.remove("discover-consigliati-active");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", defaultThemeColor);
    }
    return () => {
      document.body.classList.remove("discover-consigliati-active");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", defaultThemeColor);
    };
  }, [activeTab]);

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
    <div
      className={`min-h-screen relative overflow-x-hidden discover-page${activeTab === "per-te" ? " discover-consigliati-strip-visible" : ""}`}
    >
      <Header />

      {/* Tab bar + strip: Seguiti | Consigliati; sotto il link passa alla visione generale / visione verticale */}
      <div className="discover-tab-bar-wrapper sticky top-[var(--header-height,3.5rem)] z-30">
        <div className="discover-tab-bar">
          <div className="mx-auto px-4 max-w-2xl">
            <div className="flex">
              <button
                type="button"
                onClick={() => setTab("seguiti")}
                className={`flex-1 py-3.5 text-center text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "seguiti"
                    ? "discover-tab-active border-primary"
                    : "border-transparent"
                }`}
              >
                Seguiti
              </button>
              <button
                type="button"
                onClick={() => setTab("per-te")}
                className={`flex-1 py-3.5 text-center text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "per-te"
                    ? "discover-tab-active border-primary"
                    : "border-transparent"
                }`}
              >
                Consigliati
              </button>
            </div>
          </div>
        </div>
        {activeTab === "per-te" && (
          <div className="discover-consigliati-strip-zone md:hidden">
            <Link
              href="/discover/consigliati"
              className="discover-consigliati-strip flex items-center justify-center py-3 px-4"
              aria-label="Passa alla visione generale degli eventi consigliati"
            >
              <span className="discover-consigliati-strip-text font-medium uppercase text-white/80">
                -passa alla visione generale-
              </span>
            </Link>
          </div>
        )}
      </div>

      {activeTab === "per-te" ? (
        <>
          {/* Feed sotto header, tab bar e strip: non li copre mai */}
          <div
            id="main-content"
            className="discover-feed-fullviewport discover-feed-below-chrome fixed left-0 right-0 flex flex-col"
            style={{
              top: "calc(var(--header-height, 3.5rem) + var(--discover-tab-bar-h, 52px) + var(--discover-consigliati-strip-zone-h, 0px))",
              height: "calc(100dvh - (var(--header-height, 3.5rem) + var(--discover-tab-bar-h, 52px) + var(--discover-consigliati-strip-zone-h, 0px)))",
            }}
          >
            <ConsigliatiFeed />
          </div>
        </>
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
    </div>
  );
}
