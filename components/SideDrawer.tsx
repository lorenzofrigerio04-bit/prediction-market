"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  IconBell,
  IconChat,
  IconCog,
  IconShield,
  IconTarget,
  IconWallet,
  IconLogout,
  IconLock,
  IconClose,
} from "@/components/ui/Icons";

const DRAWER_LINK =
  "flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-fg hover:bg-surface/50 transition-colors text-left font-medium min-h-[48px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none border border-transparent";

function DrawerLink({
  href,
  children,
  icon: Icon,
  onClick,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${DRAWER_LINK} ${active ? "bg-primary/10 text-primary" : "text-fg"}`}
    >
      <Icon className="w-5 h-5" />
      {children}
    </Link>
  );
}

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

export default function SideDrawer({ open, onClose, isAuthenticated, isAdmin }: SideDrawerProps) {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = panelRef.current?.querySelectorAll(
      'a[href], button:not([disabled])'
    );
    const first = focusable?.[0] as HTMLElement | undefined;
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleLogout = async () => {
    onClose();
    try {
      await signOut({ callbackUrl: "/" });
    } catch {
      window.location.href = "/auth/logout";
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 md:bg-black/40 transition-opacity"
      aria-hidden={!open}
    >
      <aside
        ref={panelRef}
        role="dialog"
        aria-label="Menu utility"
        className="side-drawer-panel fixed top-0 right-0 h-full w-[min(320px,85vw)] shadow-overlay flex flex-col transition-transform duration-200 ease-out"
        style={{ paddingTop: "var(--safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <span className="text-ds-body font-semibold text-fg tracking-title">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl text-fg-muted hover:bg-surface/50 hover:text-fg transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.98]"
            aria-label="Chiudi menu"
          >
            <IconClose className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" aria-label="Menu utility">
          {isAuthenticated && (
            <>
              {/* Sezione: Impegnati (wallet, missioni, notifiche) — uso meno frequente */}
              <div className="flex flex-col gap-1">
                <span className="text-ds-micro font-semibold uppercase tracking-label text-fg-muted px-4 py-1">
                  Personale
                </span>
                <DrawerLink href="/wallet" icon={IconWallet} active={isActive("/wallet")} onClick={onClose}>
                  Wallet
                </DrawerLink>
                <DrawerLink href="/missions" icon={IconTarget} active={isActive("/missions")} onClick={onClose}>
                  Missioni
                </DrawerLink>
                <DrawerLink href="/notifications" icon={IconBell} active={isActive("/notifications")} onClick={onClose}>
                  Notifiche
                </DrawerLink>
              </div>

              {/* Sezione: Account e utilità */}
              <div className="flex flex-col gap-1">
                <span className="text-ds-micro font-semibold uppercase tracking-label text-fg-muted px-4 py-1">
                  Account
                </span>
                <DrawerLink href="/support" icon={IconChat} active={isActive("/support")} onClick={onClose}>
                  Supporto
                </DrawerLink>
                <DrawerLink href="/settings" icon={IconCog} active={isActive("/settings")} onClick={onClose}>
                  Impostazioni
                </DrawerLink>
                {isAdmin && (
                  <DrawerLink href="/admin" icon={IconShield} active={isActive("/admin")} onClick={onClose}>
                    Admin
                  </DrawerLink>
                )}
              </div>

              <div className="mt-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${DRAWER_LINK} text-fg-muted w-full`}
                >
                  <IconLogout className="w-5 h-5" />
                  Esci
                </button>
              </div>
            </>
          )}
          {!isAuthenticated && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-ds-micro font-semibold uppercase tracking-label text-fg-muted px-4 py-1">
                  Account
                </span>
                <DrawerLink href="/support" icon={IconChat} active={isActive("/support")} onClick={onClose}>
                  Supporto
                </DrawerLink>
              </div>
              <div className="mt-2 pt-4 border-t border-white/10">
                <Link
                  href="/auth/login"
                  onClick={onClose}
                  className={`${DRAWER_LINK} text-primary font-semibold`}
                >
                  <IconLock className="w-5 h-5" />
                  Accedi
                </Link>
              </div>
            </>
          )}
        </nav>
      </aside>
    </div>
  );
}
