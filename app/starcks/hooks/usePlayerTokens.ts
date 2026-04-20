"use client";

import { useState, useMemo } from "react";
import {
  MOCK_PLAYER_TOKENS,
  PlayerToken,
  Position,
  Competition,
  Volatility,
} from "../utils/mockTokenData";

export type SortOption = "closing" | "volume" | "volatility" | "alphabetical";

export interface FilterState {
  competitions: Competition[];
  positions: Position[];
  volatilities: Volatility[];
}

const DEFAULT_FILTERS: FilterState = {
  competitions: [],
  positions: [],
  volatilities: [],
};

export function usePlayerTokens() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("volume");
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered = useMemo(() => {
    let list = [...MOCK_PLAYER_TOKENS];

    if (filters.competitions.length > 0) {
      list = list.filter((p) => filters.competitions.includes(p.competition));
    }
    if (filters.positions.length > 0) {
      list = list.filter((p) => filters.positions.includes(p.position));
    }
    if (filters.volatilities.length > 0) {
      list = list.filter((p) => filters.volatilities.includes(p.volatility));
    }

    list.sort((a, b) => {
      switch (sort) {
        case "volume": {
          const aVol = a.markets.reduce((s, m) => s + m.bets, 0);
          const bVol = b.markets.reduce((s, m) => s + m.bets, 0);
          return bVol - aVol;
        }
        case "volatility": {
          const rank = { high: 0, medium: 1, low: 2 };
          return rank[a.volatility] - rank[b.volatility];
        }
        case "closing": {
          const aClose = Math.min(...a.markets.map((m) => new Date(m.closingTime).getTime()));
          const bClose = Math.min(...b.markets.map((m) => new Date(m.closingTime).getTime()));
          return aClose - bClose;
        }
        case "alphabetical":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return list;
  }, [filters, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function loadMore() {
    setVisibleCount((c) => c + 4);
  }

  function toggleCompetition(c: Competition) {
    setFilters((f) => ({
      ...f,
      competitions: f.competitions.includes(c)
        ? f.competitions.filter((x) => x !== c)
        : [...f.competitions, c],
    }));
  }

  function togglePosition(p: Position) {
    setFilters((f) => ({
      ...f,
      positions: f.positions.includes(p)
        ? f.positions.filter((x) => x !== p)
        : [...f.positions, p],
    }));
  }

  function setVolatility(v: Volatility | null) {
    setFilters((f) => ({
      ...f,
      volatilities: v ? [v] : [],
    }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setVisibleCount(6);
  }

  return {
    players: visible,
    totalFiltered: filtered.length,
    filters,
    sort,
    setSort,
    hasMore,
    loadMore,
    toggleCompetition,
    togglePosition,
    setVolatility,
    resetFilters,
  };
}

export function useActiveMarkets() {
  const [sortBy, setSortBy] = useState<SortOption>("closing");

  const markets = useMemo(() => {
    const all: Array<{ player: PlayerToken; market: (typeof MOCK_PLAYER_TOKENS)[0]["markets"][0] }> =
      [];
    for (const player of MOCK_PLAYER_TOKENS) {
      for (const market of player.markets) {
        all.push({ player, market });
      }
    }

    all.sort((a, b) => {
      switch (sortBy) {
        case "closing":
          return new Date(a.market.closingTime).getTime() - new Date(b.market.closingTime).getTime();
        case "volume":
          return b.market.bets - a.market.bets;
        default:
          return 0;
      }
    });

    return all;
  }, [sortBy]);

  return { markets, sortBy, setSortBy };
}
