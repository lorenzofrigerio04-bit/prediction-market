import { describe, expect, it } from "vitest";
import { SPORT_CATEGORIES } from "@/lib/sport-categories";
import { GET } from "./route";

describe("GET /api/events/categories", () => {
  it("returns categories aligned with SPORT_CATEGORIES (validator)", async () => {
    const response = await GET(new Request("http://localhost/api/events/categories"));
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("categories");
    expect(Array.isArray(body.categories)).toBe(true);
    expect(body.categories).toEqual([...SPORT_CATEGORIES]);
    expect(body.categories).toContain("Calcio");
    expect(body.categories).toContain("Tennis");
    expect(body.categories).toContain("Pallacanestro");
    expect(body.categories).toContain("Pallavolo");
    expect(body.categories).toContain("Formula 1");
    expect(body.categories).toContain("MotoGP");
    expect(body.categories).not.toContain("Eventi in tendenza");
  });

  it("returns exactly 6 categories", async () => {
    const response = await GET(new Request("http://localhost/api/events/categories"));
    const body = await response.json();
    expect(body.categories).toHaveLength(6);
  });
});
