import Header from "@/components/Header";
import BackLink from "@/components/ui/BackLink";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-4 py-6 md:py-10 max-w-3xl">
        <BackLink
          href="/"
          className="inline-flex items-center gap-2 text-fg-muted hover:text-fg text-sm font-medium mb-6 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-lg min-h-[44px] items-center"
        >
          ← Indietro
        </BackLink>
        {children}
      </main>
    </div>
  );
}
