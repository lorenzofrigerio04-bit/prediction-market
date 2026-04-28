import Image from "next/image";
import Link from "next/link";
import type { NewsFormat } from "@/lib/news-engine/types";
import {
  FORMAT_ACCENT,
  formatArticleKindLabel,
  PERSONA_AVATARS,
  PERSONA_DISPLAY_NAME,
  timeAgo,
} from "@/lib/news-article-ui";

export type RelatedNewsRailItem = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  format: NewsFormat;
  authorPersona: string;
  publishedAt: string;
  readingTimeMin: number;
};

export function RelatedNewsRail({ items }: { items: RelatedNewsRailItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="related-news-heading">
      {/* Separatore: hairline più leggibile, glow molto soft */}
      <div className="mb-12 w-full px-2" aria-hidden>
        <div
          className="mx-auto h-px max-w-[min(100%,560px)]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.09) 8%, rgba(255,255,255,0.26) 50%, rgba(255,255,255,0.09) 92%, transparent 100%)",
            boxShadow: "0 0 18px rgba(255,255,255,0.055), 0 1px 0 rgba(255,255,255,0.04)",
          }}
        />
      </div>

      <h2
        id="related-news-heading"
        className="mb-9 text-center text-[0.8125rem] font-medium leading-snug text-white/55"
        style={{
          fontFamily: "var(--font-sans)",
          letterSpacing: "0.02em",
        }}
      >
        Potrebbe interessarti
      </h2>

      <div className="-mx-4 overflow-x-auto scrollbar-hide px-4 pb-1">
        <div className="flex gap-3" style={{ width: "max-content" }}>
          {items.map((item) => {
            const accent = FORMAT_ACCENT[item.format];
            const displayName = PERSONA_DISPLAY_NAME[item.authorPersona] ?? item.authorPersona;
            const avatarSrc = PERSONA_AVATARS[item.authorPersona];
            const initials = displayName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const preview =
              item.excerpt?.trim() ||
              item.body.split(/[.!?]\s+/).slice(0, 1).join(". ").slice(0, 110).trim();

            return (
              <Link
                key={item.slug}
                href={`/news/${encodeURIComponent(item.slug)}`}
                className="group relative w-[218px] min-w-[218px] shrink-0 overflow-hidden rounded-2xl px-4 pb-4 pt-3.5 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                style={{
                  background: "linear-gradient(165deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.014) 55%, rgba(0,0,0,0.08) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 2px 0 0 rgba(255,255,255,0.03) inset, 0 18px 40px -28px rgba(0,0,0,0.75)",
                }}
              >
                <div
                  aria-hidden
                  className="absolute left-0 right-0 top-0 h-[2px] opacity-90"
                  style={{ background: accent.topBar }}
                />

                <div className="flex items-center gap-2.5">
                  <div
                    className="h-8 w-8 shrink-0 overflow-hidden rounded-full"
                    style={{ border: `1px solid ${accent.cardBorder}` }}
                  >
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt=""
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: accent.glow }}
                      >
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-white/62">{displayName}</p>
                    <p className="mt-0.5 text-[10px] text-white/32">
                      {timeAgo(item.publishedAt)} · {item.readingTimeMin} min
                    </p>
                  </div>
                </div>

                <p
                  className={`mt-3 font-[Oswald] text-[9px] font-semibold uppercase tracking-[0.18em] ${accent.labelColor}`}
                >
                  {formatArticleKindLabel(item.format)}
                </p>

                <h3
                  className="mt-2 line-clamp-2 text-[0.9rem] font-semibold leading-snug tracking-[-0.015em] text-white/95 group-hover:text-white transition-colors"
                >
                  {item.title}
                </h3>

                {preview ? (
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/38">{preview}</p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
