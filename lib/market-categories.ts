export const MARKET_CATEGORIES = [
  { id: "trending", label: "Tendenza", href: "/discover/tutti?sort=popular" },
  { id: "elections", label: "Elezioni", href: "/discover/elezioni" },
  { id: "politics", label: "Politica", href: "/discover/politica" },
  { id: "sports", label: "Sport", href: "/discover/sport" },
  { id: "culture", label: "Cultura", href: "/discover/cultura" },
  { id: "crypto", label: "Cripto", href: "/discover/cripto" },
  { id: "climate", label: "Clima", href: "/discover/clima" },
  { id: "economics", label: "Economia", href: "/discover/economia" },
  { id: "mentions", label: "Menzioni", href: "/discover/menzioni" },
  { id: "companies", label: "Aziende", href: "/discover/aziende" },
  { id: "finance", label: "Finanza", href: "/discover/finanza" },
  { id: "tech-science", label: "Tecnologia e Scienza", href: "/discover/tecnologia-e-scienza" },
] as const;

export type MarketCategoryId = (typeof MARKET_CATEGORIES)[number]["id"];
