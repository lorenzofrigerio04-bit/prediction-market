"use client";

/**
 * Linea decorativa stile Tiffany: massima intensità al centro, sfumatura verso gli estremi.
 */
export default function ShopTiffanyDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative mx-auto w-full max-w-4xl overflow-visible px-2 ${className}`}
      aria-hidden
    >
      <div
        className="relative mx-auto h-[2px] w-full max-w-3xl rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(10, 186, 181, 0.06) 10%, rgba(125, 211, 208, 0.9) 50%, rgba(10, 186, 181, 0.06) 90%, transparent 100%)",
          boxShadow:
            "0 0 20px rgba(45, 212, 191, 0.42), 0 0 40px rgba(10, 186, 181, 0.12), 0 1px 0 rgba(255,255,255,0.06) inset",
        }}
      />
    </div>
  );
}
