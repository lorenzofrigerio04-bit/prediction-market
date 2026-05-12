/** UI istantaneo durante le transizioni App Router (streaming della nuova route). */
export default function Loading() {
  return (
    <div className="min-h-[50vh] w-full animate-pulse px-4 py-6">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="h-9 w-3/4 rounded-lg bg-white/[0.07]" />
        <div className="h-40 rounded-2xl border border-white/[0.06] bg-white/[0.04]" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full rounded bg-white/[0.06]" />
          <div className="h-3 w-5/6 rounded bg-white/[0.05]" />
          <div className="h-3 w-4/6 rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
