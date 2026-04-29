import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NEWS_SECTIONS, newsFormatFromSlug } from "@/lib/news-format-sections";
import { PERSONAS } from "@/lib/news-engine/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ format: string }>;
}): Promise<Metadata> {
  const { format: slug } = await params;
  const formatKey = newsFormatFromSlug(slug);
  const section = formatKey ? NEWS_SECTIONS.find((s) => s.format === formatKey) : undefined;
  if (!section || !formatKey) return { title: "News" };
  const persona = PERSONAS[formatKey];
  return {
    title: `${persona.name} · ${section.title} · News`,
    description: `Articoli di ${persona.name} (${section.title}).`,
  };
}

export default function NewsFormatLayout({ children }: { children: ReactNode }) {
  return children;
}
