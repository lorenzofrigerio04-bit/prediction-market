"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";

const navLinkClass =
  "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left font-medium focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 outline-none";

function NavLink({
  href,
  children,
  icon,
  active = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${navLinkClass} ${active ? "bg-accent-50 text-accent-700 font-semibold" : ""} ${className}`}
    >
      {icon}
      {children}
    </Link>
  );
}

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Errore durante il logout:", error);
      window.location.href = "/auth/logout";
    }
  };

  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

  const MainNavContent = () => (
    <>
      <NavLink href="/leaderboard" active={isActive("/leaderboard")}>
        <span className="text-lg" aria-hidden>🏆</span>
        Classifica
      </NavLink>
      {status === "loading" ? (
        <span className="px-4 py-3 text-slate-500 text-sm">Caricamento...</span>
      ) : session ? (
        <>
          {session.user?.role === "ADMIN" && (
            <NavLink href="/admin" active={isActive("/admin")}>
              <span className="text-lg" aria-hidden>⚙️</span>
              Admin
            </NavLink>
          )}
          <NavLink href="/wallet" active={isActive("/wallet")}>
            <span className="text-lg" aria-hidden>💰</span>
            Wallet
          </NavLink>
          <NavLink href="/missions" active={isActive("/missions")}>
            <span className="text-lg" aria-hidden>🎯</span>
            Missioni
          </NavLink>
          <NotificationBell />
          <NavLink href="/profile" active={isActive("/profile")}>
            <span className="text-lg" aria-hidden>👤</span>
            Profilo
          </NavLink>
          <span
            className="px-4 py-3 text-slate-600 text-sm truncate max-w-[180px]"
            title={session.user?.name || session.user?.email || ""}
          >
            Ciao, {session.user?.name || session.user?.email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className={`${navLinkClass} text-slate-600 border-t border-slate-100 mt-2 pt-4`}
          >
            <span className="text-lg" aria-hidden>🚪</span>
            Esci
          </button>
        </>
      ) : (
        <>
          <NavLink href="/auth/login">Accedi</NavLink>
          <Link
            href="/auth/signup"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent-500 text-white font-semibold hover:bg-accent-600 transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            Registrati
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      {/* Top bar - mobile & desktop */}
      <header
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80"
        style={{ paddingTop: "var(--safe-area-inset-top)" }}
      >
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link
              href="/"
              className="text-lg md:text-xl font-bold text-slate-900 tracking-tight focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 rounded-lg"
            >
              Prediction Market
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Menu principale">
              <MainNavContent />
            </nav>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-accent-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {mobileOpen && (
            <nav
              className="md:hidden py-4 border-t border-slate-100 flex flex-col gap-1 max-h-[70vh] overflow-y-auto scrollbar-thin"
              aria-label="Menu principale"
            >
              <MainNavContent />
            </nav>
          )}
        </div>
      </header>

      {/* Bottom nav - solo mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/80"
        style={{ paddingBottom: "var(--safe-area-inset-bottom)" }}
        aria-label="Navigazione principale"
      >
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-xl transition-colors ${
              pathname === "/" ? "text-accent-600 bg-accent-50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/leaderboard"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-xl transition-colors ${
              isActive("/leaderboard") ? "text-accent-600 bg-accent-50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="text-xl">🏆</span>
            <span className="text-xs font-medium">Classifica</span>
          </Link>
          {session ? (
            <>
              <Link
                href="/wallet"
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-xl transition-colors ${
                  isActive("/wallet") ? "text-accent-600 bg-accent-50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-xl">💰</span>
                <span className="text-xs font-medium">Wallet</span>
              </Link>
              <Link
                href="/missions"
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-xl transition-colors ${
                  isActive("/missions") ? "text-accent-600 bg-accent-50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-xl">🎯</span>
                <span className="text-xs font-medium">Missioni</span>
              </Link>
              <Link
                href="/profile"
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-xl transition-colors ${
                  isActive("/profile") ? "text-accent-600 bg-accent-50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-xl">👤</span>
                <span className="text-xs font-medium">Profilo</span>
              </Link>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            >
              <span className="text-xl">🔐</span>
              <span className="text-xs font-medium">Accedi</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
