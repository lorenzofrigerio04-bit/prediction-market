import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import type { NewsFormat } from "@/lib/news-engine/types";
import { newsRailEdgeMaskStyle } from "@/lib/news-rail-mask";
import {
  FORMAT_ACCENT,
  formatArticleKindLabel,
  PERSONA_AVATARS,
  PERSONA_DISPLAY_NAME,
  timeAgo,
} from "@/lib/news-article-ui";

const previewFont = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
});

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

function previewText(item: RelatedNewsRailItem): string {
  const ex = item.excerpt?.trim();
  if (ex) return ex;
  return item.body.split(/[.!?]\s+/).slice(0, 2).join(". ").trim();
}

export function RelatedNewsRail({ items }: { items: RelatedNewsRailItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="related-news-heading">
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

      <div className="-mx-4">
        <div className="overflow-x-auto scrollbar-hide px-4 pb-1" style={newsRailEdgeMaskStyle}>
          <div className="flex gap-2.5 pb-2" style={{ width: "max-content" }}>
          {items.map((item) => {
            const accent = FORMAT_ACCENT[item.format];
            const format = item.format;
            const displayName = PERSONA_DISPLAY_NAME[item.authorPersona] ?? item.authorPersona;
            const avatarSrc = PERSONA_AVATARS[item.authorPersona];
            const initials = displayName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const preview = previewText(item);

            return (
              <Link
                key={item.slug}
                href={`/news/${encodeURIComponent(item.slug)}`}
                className={[
                  "group relative flex w-[260px] min-w-[260px] shrink-0 flex-col text-left sm:w-[268px] sm:min-w-[268px]",
                  "rounded-[1.15rem] border border-white/[0.06] bg-white/[0.015] p-4",
                  "transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out",
                  "hover:border-white/[0.11] hover:bg-white/[0.03] hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.5)]",
                  "active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background-primary))]",
                ].join(" ")}
              >
                <div className="flex gap-3 items-start">
                  <div
                    className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
                    style={{
                      border: `1.5px solid ${accent.cardBorder}`,
                      boxShadow: `0 0 22px -8px ${accent.glow}`,
                    }}
                  >
                    {avatarSrc ? (
                      <Image src={avatarSrc} alt="" width={40} height={40} className="h-full w-full object-cover" />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: accent.glow }}
                      >
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-h-10 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className="max-w-[9.5rem] truncate text-[13px] font-semibold tracking-tight text-white">
                        {displayName}
                      </span>
                      <span className="text-[11px] text-white/28">·</span>
                      <time className="text-[11px] text-white/38" dateTime={item.publishedAt}>
                        {timeAgo(item.publishedAt)}
                      </time>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`news-format-badge inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${accent.labelColor}`}
                      >
                        <span className={`h-1 w-1 shrink-0 rounded-full ${accent.dot}`} />
                        {formatArticleKindLabel(format)}
                      </span>
                    </div>
                  </div>
                </div>

                <header className="mt-4">
                  <h3
                    className="line-clamp-2 text-[1.02rem] font-bold leading-[1.12] tracking-[-0.022em] text-white transition-colors duration-200 group-hover:text-white/92 sm:text-[1.0625rem]"
                    style={{ fontFamily: "var(--font-kalshi-title)" }}
                  >
                    {item.title}
                  </h3>
                  <div className="relative mt-4 w-full" aria-hidden>
                    <div
                      className="h-px w-full"
                      style={{
                        background: accent.topBar,
                        boxShadow: `0 0 18px -2px ${accent.glow}, 0 0 1px rgba(255,255,255,0.06)`,
                      }}
                    />
                  </div>
                </header>

                {preview ? (
                  <div className={`${previewFont.className} mt-4 flex flex-col gap-2.5`}>
                    <p className="text-[0.8125rem] font-normal leading-[1.62] tracking-[0.01em] text-white/[0.52] antialiased [overflow-wrap:anywhere] line-clamp-3">
                      {preview}
                    </p>
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                      <span className="shrink-0 text-[11px] font-medium tabular-nums text-white/38">
                        {item.readingTimeMin} min lettura
                      </span>
                      <span
                        className={`inline-flex min-w-0 items-center justify-end gap-1.5 font-kalshi text-[11px] font-semibold leading-none tracking-[-0.02em] sm:text-xs ${accent.labelColor} transition-[opacity,transform] duration-200 group-hover:opacity-90`}
                      >
                        Leggi di più
                        <span
                          aria-hidden
                          className="text-[0.8rem] font-bold opacity-90 transition-transform duration-200 group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
