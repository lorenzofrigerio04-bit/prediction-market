"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SideDrawer from "@/components/SideDrawer";
import OracleChat from "@/components/oracle/OracleChat";
import OracleHeader from "@/components/oracle/OracleHeader";
import OracleBottomNav from "@/components/oracle/OracleBottomNav";

export default function OraclePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent("/oracle")}`);
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-[#171717] flex flex-col">
        <main
          id="main-content"
          className="flex-1 flex items-center justify-center px-4"
        >
          <p className="text-fg-muted text-ds-body">Caricamento...</p>
        </main>
      </div>
    );
  }

  const handleNewChat = useCallback(() => {
    setHistoryOpen(false);
    const event = new CustomEvent("oracle-new-chat");
    window.dispatchEvent(event);
  }, []);

  return (
    <div className="min-h-screen bg-[#171717] flex flex-col">
      <OracleHeader
        onMenuClick={() => setHistoryOpen(true)}
        onNewChat={handleNewChat}
      />
      <main
        id="main-content"
        className="flex-1 flex flex-col min-h-0 pb-[calc(5rem+var(--safe-area-inset-bottom,0px))] md:pb-8 relative"
        style={{ paddingTop: "calc(52px + var(--safe-area-inset-top))" }}
      >
        <div className="flex-1 min-h-0 flex flex-col max-w-3xl mx-auto w-full relative">
          <OracleChat
            historyOpen={historyOpen}
            onHistoryClose={() => setHistoryOpen(false)}
            onNewChat={handleNewChat}
            onOpenAppMenu={() => setDrawerOpen(true)}
          />
        </div>
      </main>
      <OracleBottomNav />
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAuthenticated={status === "authenticated" && !!session}
        isAdmin={session?.user?.role === "ADMIN"}
      />
    </div>
  );
}
