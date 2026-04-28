"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type AvatarImageLightboxProps = {
  src: string;
  name?: string | null;
  /** Classi per il pulsante-trigger (es. bordo, ring). Larghezza/altezza tipicamente in sizeClass. */
  sizeClass?: string;
  className?: string;
  /** Stile inline sul trigger (es. bordo/sombra dinamici dalla pagina). */
  triggerStyle?: CSSProperties;
};

/**
 * Avatar cliccabile: apre overlay full-screen stile “story” / Instagram (foto profilo grande, sfondo scuro sfocato).
 */
export function AvatarImageLightbox({
  src,
  name,
  sizeClass = "w-9 h-9",
  className = "",
  triggerStyle,
}: AvatarImageLightboxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={triggerStyle}
        className={`${sizeClass} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 ring-2 ring-transparent transition-[box-shadow,transform] hover:ring-primary/35 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--admin-bg))] ${className}`}
        aria-label={name ? `Apri foto profilo di ${name}` : "Apri foto profilo"}
      >
        {/* Avatar esterni (OAuth): dominio variabile → img nativo */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[280]" role="dialog" aria-modal="true" aria-label="Foto profilo">
          <button
            type="button"
            className="absolute inset-0 z-0 cursor-default border-0 bg-black/88 backdrop-blur-lg"
            aria-label="Chiudi"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex min-h-full items-center justify-center p-6 pointer-events-none">
            <div
              className="pointer-events-auto flex max-w-[92vw] flex-col items-center gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-4">
                <img
                  src={src}
                  alt=""
                  className="h-[min(72vmin,320px)] w-[min(72vmin,320px)] rounded-full object-cover shadow-[0_0_0_3px_rgba(255,255,255,0.14),0_28px_64px_rgba(0,0,0,0.55)]"
                />
                {name ? <p className="text-center text-base font-medium text-white">{name}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] rounded-full border border-white/20 bg-white/10 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/18"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
