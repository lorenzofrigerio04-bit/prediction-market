"use client";

import Header from "@/components/Header";
import MainSwipeView from "@/components/MainSwipeView";
import { usePathname } from "next/navigation";
import { MAIN_TAB_PATHS } from "@/lib/main-tabs";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMainTab = MAIN_TAB_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p))
  );

  // Su mobile: swipe tra le 5 sezioni; su desktop: comportamento normale con animazione leggera
  if (isMainTab) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <MainSwipeView>{children}</MainSwipeView>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      {children}
    </div>
  );
}
