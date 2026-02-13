"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";

const navLinkClass =
  "text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 outline-none";

export default function Header() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Errore durante il logout:", error);
      window.location.href = "/auth/logout";
    }
  };

  const NavContent = () => (
    <>
      <Link href="/leaderboard" className={navLinkClass}>
        🏆 Classifica
      </Link>
      {status === "loading" ? (
        <span className="text-gray-500 px-3 py-2 text-sm">Caricamento...</span>
      ) : session ? (
        <>
          {session.user?.role === "ADMIN" && (
            <Link href="/admin" className={`${navLinkClass} font-medium`}>
              ⚙️ Admin
            </Link>
          )}
          <Link href="/wallet" className={navLinkClass}>
            Wallet
          </Link>
          <Link href="/missions" className={navLinkClass}>
            🎯 Missioni
          </Link>
          <NotificationBell />
          <Link href="/profile" className={navLinkClass}>
            Profilo
          </Link>
          <span className="text-gray-600 px-3 py-2 text-sm truncate max-w-[140px] md:max-w-none" title={session.user?.name || session.user?.email || ""}>
            Ciao, {session.user?.name || session.user?.email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className={`${navLinkClass} text-left w-full md:w-auto`}
          >
            Esci
          </button>
        </>
      ) : (
        <>
          <Link href="/auth/login" className={navLinkClass}>
            Accedi
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Registrati
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
          >
            Prediction Market
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Menu principale">
            <NavContent />
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500"
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

        {/* Mobile nav */}
        {mobileOpen && (
          <nav
            className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-1"
            aria-label="Menu principale"
          >
            <NavContent />
          </nav>
        )}
      </div>
    </header>
  );
}
