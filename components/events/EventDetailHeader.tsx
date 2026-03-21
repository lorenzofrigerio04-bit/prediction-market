"use client";

import { useState } from "react";
import { PredictionMasterLogoCompact } from "@/components/PredictionMasterMark";
import { IconMenu } from "@/components/ui/Icons";
import SideDrawer from "@/components/SideDrawer";
import { useSession } from "next-auth/react";

export default function EventDetailHeader() {
  const { data: session, status } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 bg-[rgb(var(--admin-bg))]"
        style={{ paddingTop: "var(--safe-area-inset-top)" }}
      >
        <div className="mx-auto px-4 max-w-4xl">
          <div className="flex h-14 md:h-16 items-center justify-between">
            <div className="flex h-full min-w-0 items-center">
              <PredictionMasterLogoCompact />
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-fg-muted hover:text-fg hover:bg-white/[0.08] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--admin-bg))] touch-manipulation active:scale-[0.96]"
              aria-label="Menu"
              aria-expanded={drawerOpen}
            >
              <IconMenu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <div className="h-14 md:h-16" style={{ marginTop: "var(--safe-area-inset-top)" }} aria-hidden />
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAuthenticated={status === "authenticated"}
        isAdmin={session?.user?.role === "ADMIN"}
      />
    </>
  );
}
