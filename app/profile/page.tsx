"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { trackView } from "@/lib/analytics-client";
import { LoadingBlock } from "@/components/ui";

const AVATAR_MAX_SIZE = 400;
const AVATAR_JPEG_QUALITY = 0.88;

/** Ridimensiona un file immagine e restituisce un data URL JPEG per ridurre il payload */
function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      let dw = w;
      let dh = h;
      if (w > AVATAR_MAX_SIZE || h > AVATAR_MAX_SIZE) {
        if (w >= h) {
          dw = AVATAR_MAX_SIZE;
          dh = Math.round((h * AVATAR_MAX_SIZE) / w);
        } else {
          dh = AVATAR_MAX_SIZE;
          dw = Math.round((w * AVATAR_MAX_SIZE) / h);
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = dw;
      canvas.height = dh;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas non disponibile"));
        return;
      }
      ctx.drawImage(img, 0, 0, dw, dh);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", AVATAR_JPEG_QUALITY);
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossibile leggere l'immagine"));
    };
    img.src = url;
  });
}

interface ProfileStats {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
  stats: {
    credits: number;
    totalEarned: number;
    totalSpent: number;
    streak: number;
    accuracy: number;
    totalPredictions: number;
    correctPredictions: number;
    activePredictions: number;
    wonPredictions: number;
    lostPredictions: number;
    roi: number;
    eventsCreatedCount?: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string | null;
    rarity: string;
    unlockedAt: string;
  }>;
  followedEventsCount?: number;
  followedEvents?: Array<{ id: string; title: string }>;
}

interface BadgeFromApi {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  rarity: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

function validateUsernameClient(value: string): string | null {
  const t = value.trim();
  if (t.length === 0) return "Inserisci un username";
  if (t.length < USERNAME_MIN) return `Almeno ${USERNAME_MIN} caratteri`;
  if (t.length > USERNAME_MAX) return `Massimo ${USERNAME_MAX} caratteri`;
  if (!USERNAME_REGEX.test(t)) return "Solo lettere, numeri e underscore";
  return null;
}

/* ── UI UX Pro Max: Dark Mode OLED + Fintech/Prediction Market ── */

const RARITY_BADGE_STYLES: Record<string, string> = {
  legendary: "border border-[#CA8A04]/50 bg-[#0a0900] shadow-[0_0_16px_-4px_rgba(202,138,4,0.4)]",
  epic:      "border border-violet-400/40 bg-[#080610] shadow-[0_0_16px_-4px_rgba(167,139,250,0.3)]",
  rare:      "border border-[#50F5FC]/35 bg-[#000d0e] shadow-[0_0_16px_-4px_rgba(80,245,252,0.25)]",
  common:    "border border-white/[0.10] bg-[#0c0e14]",
};

const RARITY_TEXT_STYLES: Record<string, string> = {
  legendary: "text-[#CA8A04]",
  epic:      "text-violet-400",
  rare:      "text-[#50F5FC]",
  common:    "text-white/50",
};

const LOCKED_BADGE_STYLE =
  "border border-white/[0.05] bg-[#0c0e14]";

const PROFILE_SECTION_TITLE_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35";

const PROFILE_DOCUMENT_LINK_CLASS =
  "group flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer transition-colors duration-200 ease-out hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#50F5FC]/50";

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  /** Evita doppio updateSession; reset su logout (unauthenticated). */
  const syncedUserIdRef = useRef<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allBadges, setAllBadges] = useState<BadgeFromApi[]>([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const displayName = profileData?.user?.username?.trim() || profileData?.user?.name?.trim() || "Utente";

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile/stats");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }
        const message = typeof data?.error === "string" ? data.error : "Errore nel caricamento del profilo";
        throw new Error(message);
      }
      setProfileData(data as ProfileStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore nel caricamento dei dati del profilo";
      console.error("Error fetching profile data:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      let cancelled = false;
      void (async () => {
        /* useSession può essere indietro rispetto al cookie; evita redirect al form credenziali se la sessione c'è. */
        const s = await getSession();
        if (cancelled) return;
        if (s?.user?.id) {
          try {
            await updateSession();
          } catch {
            /* ignore */
          }
          return;
        }
        syncedUserIdRef.current = null;
        router.push("/auth/login");
      })();
      return () => {
        cancelled = true;
      };
    }
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    let cancelled = false;
    void (async () => {
      /* Dopo Google OAuth useSession può restare indietro rispetto al cookie: prima sync, poi dati profilo */
      if (syncedUserIdRef.current !== session.user.id) {
        syncedUserIdRef.current = session.user.id;
        try {
          await updateSession();
        } catch {
          /* ignore */
        }
      }
      if (cancelled) return;
      trackView("PROFILE_VIEWED", { userId: session.user.id });
      fetchProfileData();
      fetchAllBadges();
    })();

    return () => {
      cancelled = true;
    };
  }, [status, router, session?.user?.id, updateSession, fetchProfileData]);

  const fetchAllBadges = async () => {
    try {
      const res = await fetch("/api/badges");
      if (res.ok) {
        const data = await res.json();
        setAllBadges(Array.isArray(data) ? data : (data.badges ?? []));
      }
    } catch {
      // ignore
    }
  };

  const openEditModal = () => {
    setEditUsername(profileData?.user?.username?.trim() ?? profileData?.user?.name?.trim() ?? "");
    setEditImagePreview(profileData?.user?.image ?? null);
    setEditError(null);
    setEditModalOpen(true);
  };

  const handlePhotoFile = useCallback(async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setEditImagePreview(dataUrl);
    } catch (e) {
      setEditError("Impossibile processare l'immagine. Riprova.");
    }
  }, []);

  const saveProfile = async () => {
    const err = validateUsernameClient(editUsername);
    if (err) {
      setEditError(err);
      return;
    }
    setEditError(null);
    setEditSaving(true);
    try {
      const payload: { username: string; image?: string | null } = { username: editUsername.trim() };
      payload.image = editImagePreview ?? profileData?.user?.image ?? null;
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.error || "Errore nel salvataggio");
        return;
      }
      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                name: data.name ?? editUsername.trim(),
                username: data.name ?? editUsername.trim(),
                image: data.image ?? prev.user.image,
              },
            }
          : null
      );
      if (typeof updateSession === "function") {
        await updateSession();
      }
      setEditModalOpen(false);
    } catch {
      setEditError("Errore di connessione");
    } finally {
      setEditSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatPercentage = (value: number) => `${Math.round(value * 100) / 100}%`;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-admin-bg">
        <Header />
        <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
          <LoadingBlock message="Caricamento profilo..." />
        </main>
      </div>
    );
  }

  if (status === "authenticated" && session?.user && !loading && !profileData && error) {
    return (
      <div className="min-h-screen bg-admin-bg">
        <Header />
        <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
          <div className="mb-6 p-4 bg-danger/15 border border-danger/40 rounded-2xl text-danger text-ds-body-sm">
            {error}
          </div>
          <button
            type="button"
            onClick={() => {
              setError(null);
              fetchProfileData();
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white font-medium"
          >
            Riprova
          </button>
        </main>
      </div>
    );
  }

  /** Sessione ok ma dati profilo non ancora caricati: evita schermata vuota o flash del redirect login. */
  if (status === "authenticated" && session?.user && !profileData && !error) {
    return (
      <div className="min-h-screen bg-admin-bg">
        <Header />
        <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
          <LoadingBlock message="Caricamento profilo..." />
        </main>
      </div>
    );
  }

  if (!session?.user || !profileData) {
    return null;
  }

  const roiPositive = profileData.stats.roi >= 0;

  return (
    <div className="min-h-screen bg-[#000000]">
      <Header />
      <main
        id="main-content"
        className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl"
      >
        {error && (
          <div className="mb-5 p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        {/* ── HERO: Identity Card ── */}
        <div
          className="relative mb-5 rounded-2xl overflow-hidden border border-white/[0.07]"
          style={{ background: "linear-gradient(160deg, #111111 0%, #0a0a0a 100%)" }}
        >
          {/* Ambient teal glow — OLED-safe, pointer-events:none */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(80,245,252,0.08) 0%, transparent 70%)" }}
          />
          {/* Gold accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CA8A04]/40 to-transparent" aria-hidden />

          <div className="relative p-5 md:p-6">
            {/* Edit button — ghost, gold border on hover */}
            <button
              type="button"
              onClick={openEditModal}
              aria-label="Modifica profilo"
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-[0.07em] uppercase border border-white/[0.12] text-white/50 cursor-pointer transition-colors duration-200 ease-out hover:border-[#CA8A04]/60 hover:text-[#CA8A04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CA8A04]/50"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Modifica
            </button>

            {/* Avatar + Identity */}
            <div className="flex items-center gap-4 pr-24">
              <div className="relative shrink-0">
                <div
                  className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full bg-[#111] flex items-center justify-center font-bold text-xl text-[#50F5FC] overflow-hidden"
                  style={{ boxShadow: "0 0 0 1.5px rgba(80,245,252,0.25), 0 0 16px -4px rgba(80,245,252,0.2)" }}
                >
                  {profileData.user.image ? (
                    <img src={profileData.user.image} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    (displayName[0] || "?").toUpperCase()
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-kalshi text-[1.45rem] md:text-[1.6rem] text-white leading-[1.05] tracking-[0.02em] truncate">
                  {displayName}
                </h1>
                <p className="text-white/35 text-[11px] mt-0.5 tracking-[0.04em]">
                  Membro dal {formatDate(profileData.user.createdAt)}
                </p>
              </div>
            </div>

            {/* Separator */}
            <div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" aria-hidden />

            {/* Micro-stats strip — Crediti / Streak / ROI */}
            <div className="mt-4 grid grid-cols-3 gap-0">
              <div className="flex flex-col items-center gap-1 py-1">
                <span className="font-numeric text-[1.1rem] font-semibold text-white tabular-nums leading-none">
                  {profileData.stats.credits.toLocaleString("it-IT")}
                </span>
                <span className={`${PROFILE_SECTION_TITLE_CLASS} mt-0.5`}>Crediti</span>
              </div>
              <div className="flex flex-col items-center gap-1 py-1 border-x border-white/[0.06]">
                <span className="font-numeric text-[1.1rem] font-semibold text-[#CA8A04] tabular-nums leading-none">
                  {profileData.stats.streak}
                </span>
                <span className={`${PROFILE_SECTION_TITLE_CLASS} mt-0.5`}>Streak</span>
              </div>
              <div className="flex flex-col items-center gap-1 py-1">
                <span className={`font-numeric text-[1.1rem] font-semibold tabular-nums leading-none ${roiPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {roiPositive ? "+" : ""}{formatPercentage(profileData.stats.roi)}
                </span>
                <span className={`${PROFILE_SECTION_TITLE_CLASS} mt-0.5`}>ROI</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── EDIT MODAL ── */}
        {editModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onClick={() => !editSaving && setEditModalOpen(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-white/[0.09] overflow-hidden"
              style={{ background: "#111111", boxShadow: "0 25px 60px -12px rgba(0,0,0,0.8)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold top line on modal */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#CA8A04]/50 to-transparent" aria-hidden />
              <div className="px-6 py-5 border-b border-white/[0.07]">
                <h2 id="edit-profile-title" className="font-kalshi text-[1.2rem] tracking-[0.02em] text-white">
                  Modifica profilo
                </h2>
              </div>
              <div className="p-6 space-y-5">
                {/* Avatar preview */}
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full bg-[#0a0a0a] flex items-center justify-center font-bold text-2xl text-[#50F5FC] overflow-hidden shrink-0"
                    style={{ boxShadow: "0 0 0 1.5px rgba(80,245,252,0.2)" }}
                  >
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (editUsername[0] || "?").toUpperCase()
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <input ref={photoInputRef} type="file" accept="image/*" capture="user" className="hidden"
                      onChange={(e) => { handlePhotoFile(e.target.files?.[0] ?? null); e.target.value = ""; }}
                      aria-label="Scatta foto"
                    />
                    <input ref={galleryInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { handlePhotoFile(e.target.files?.[0] ?? null); e.target.value = ""; }}
                      aria-label="Scegli dalla galleria"
                    />
                    <button type="button" onClick={() => photoInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.03] text-white/70 text-sm font-medium cursor-pointer transition-colors duration-200 hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      Camera
                    </button>
                    <button type="button" onClick={() => galleryInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.03] text-white/70 text-sm font-medium cursor-pointer transition-colors duration-200 hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                      </svg>
                      Galleria
                    </button>
                  </div>
                </div>

                {/* Username field */}
                <div>
                  <label htmlFor="edit-username" className={`block ${PROFILE_SECTION_TITLE_CLASS} mb-2`}>
                    Nome utente
                  </label>
                  <input
                    id="edit-username"
                    type="text"
                    value={editUsername}
                    onChange={(e) => { setEditUsername(e.target.value); setEditError(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") saveProfile(); if (e.key === "Escape") setEditModalOpen(false); }}
                    placeholder="username"
                    className="w-full px-4 py-3 rounded-xl border border-white/[0.09] bg-[#0a0a0a] text-white placeholder:text-white/25 font-numeric text-sm transition-colors duration-200 focus:outline-none focus:border-[#50F5FC]/50 focus:shadow-[0_0_0_3px_rgba(80,245,252,0.08)]"
                    disabled={editSaving}
                    aria-invalid={!!editError}
                  />
                </div>

                {editError && (
                  <p className="text-sm text-danger" role="alert">{editError}</p>
                )}
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button type="button" onClick={() => setEditModalOpen(false)} disabled={editSaving}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.09] text-white/50 text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  Annulla
                </button>
                <button type="button" onClick={saveProfile} disabled={editSaving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-opacity duration-200 hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CA8A04]/50"
                  style={{ background: "linear-gradient(135deg, #CA8A04 0%, #92660a 100%)", color: "#000" }}
                >
                  {editSaving ? "Salvataggio…" : "Salva"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PERFORMANCE ── */}
        <p className={`${PROFILE_SECTION_TITLE_CLASS} mb-3`}>Performance</p>
        <div className="grid grid-cols-2 gap-2 md:gap-2.5 mb-5">

          {/* ROI — full accent treatment */}
          <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={PROFILE_SECTION_TITLE_CLASS}>ROI</span>
              <div className="w-7 h-7 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={roiPositive ? "text-emerald-400" : "text-red-400"} aria-hidden>
                  <polyline points={roiPositive ? "23 6 13.5 15.5 8.5 10.5 1 18" : "23 18 13.5 8.5 8.5 13.5 1 6"} />
                  {roiPositive
                    ? <polyline points="17 6 23 6 23 12" />
                    : <polyline points="17 18 23 18 23 12" />}
                </svg>
              </div>
            </div>
            <p className={`font-numeric text-2xl md:text-3xl font-bold tabular-nums leading-none ${roiPositive ? "text-emerald-400" : "text-red-400"}`}>
              {roiPositive ? "+" : ""}{formatPercentage(profileData.stats.roi)}
            </p>
            <p className="text-white/30 text-[10px] mt-2">Ritorno investimento</p>
          </div>

          {/* Precisione */}
          <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={PROFILE_SECTION_TITLE_CLASS}>Precisione</span>
              <div className="w-7 h-7 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#50F5FC]" aria-hidden>
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                </svg>
              </div>
            </div>
            <p className="font-numeric text-2xl md:text-3xl font-bold tabular-nums leading-none text-[#50F5FC]">
              {formatPercentage(profileData.stats.accuracy)}
            </p>
            <p className="text-white/30 text-[10px] mt-2">
              {profileData.stats.correctPredictions} / {profileData.stats.totalPredictions}
            </p>
          </div>

          {/* Previsioni */}
          <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={PROFILE_SECTION_TITLE_CLASS}>Previsioni</span>
              <div className="w-7 h-7 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40" aria-hidden>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
            </div>
            <p className="font-numeric text-2xl md:text-3xl font-bold tabular-nums leading-none text-white">
              {profileData.stats.totalPredictions}
            </p>
            <p className="text-white/30 text-[10px] mt-2">{profileData.stats.activePredictions} attive</p>
          </div>

          {/* Eventi creati — clickable, gold hover */}
          <Link
            href="/discover?tab=seguiti#creati"
            className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 md:p-5 cursor-pointer transition-colors duration-200 hover:border-[#CA8A04]/30 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CA8A04]/40"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`${PROFILE_SECTION_TITLE_CLASS} group-hover:text-[#CA8A04]/70 transition-colors duration-200`}>
                Creati
              </span>
              <div className="w-7 h-7 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#CA8A04]/60 group-hover:text-[#CA8A04] transition-colors duration-200" aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            </div>
            <p className="font-numeric text-2xl md:text-3xl font-bold tabular-nums leading-none text-white">
              {profileData.stats.eventsCreatedCount ?? 0}
            </p>
            <p className="text-white/30 text-[10px] mt-2 group-hover:text-[#CA8A04]/50 transition-colors duration-200">
              Visualizza tutti
            </p>
          </Link>
        </div>

        {/* ── CTA: CREA EVENTO (Gold accent — Premium fintech) ── */}
        <Link
          href="/crea"
          className="block mb-5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CA8A04]/50 rounded-xl"
        >
          <div
            className="rounded-xl border border-[#CA8A04]/20 p-4 md:p-5 transition-all duration-200 motion-reduce:transition-none group-hover:border-[#CA8A04]/45"
            style={{ background: "linear-gradient(135deg, #0e0b00 0%, #0a0a0a 100%)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg border border-[#CA8A04]/25 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-[#CA8A04]/50"
                style={{ background: "rgba(202,138,4,0.06)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#CA8A04]/70 group-hover:text-[#CA8A04] transition-colors duration-200" aria-hidden>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-kalshi text-[1.05rem] tracking-[0.03em] text-white/90 leading-tight">Crea evento</p>
                <p className="text-[11px] text-white/30 mt-0.5">Proponi un nuovo mercato di previsione</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                className="text-white/20 group-hover:text-[#CA8A04]/60 motion-reduce:translate-x-0 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* ── ACHIEVEMENTS ── */}
        <p className={`${PROFILE_SECTION_TITLE_CLASS} mb-3`}>Achievements</p>
        <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] p-4 mb-5">
          {allBadges.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">
              Completa missioni e previsioni per sbloccare achievement.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {allBadges.map((badge) => {
                const unlocked = badge.unlocked;
                const rarityKey = (badge.rarity ?? "common").toLowerCase();
                const rarityStyle = unlocked
                  ? (RARITY_BADGE_STYLES[rarityKey] ?? RARITY_BADGE_STYLES.common)
                  : LOCKED_BADGE_STYLE;
                const rarityTextStyle = unlocked
                  ? (RARITY_TEXT_STYLES[rarityKey] ?? RARITY_TEXT_STYLES.common)
                  : "text-white/20";
                return (
                  <div
                    key={badge.id}
                    className={`relative p-3.5 rounded-xl transition-colors duration-200 motion-reduce:transition-none ${rarityStyle} ${unlocked ? "" : "opacity-40"}`}
                  >
                    {!unlocked && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center" title="Da sbloccare">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30" aria-hidden>
                          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    )}
                    {/* Badge icon — use emoji from data as image/text, not UI icon */}
                    <div className="text-xl mb-2 text-center leading-none" aria-hidden>
                      {badge.icon || "★"}
                    </div>
                    <h3 className="font-semibold text-center text-[11px] mb-0.5 text-white/80 leading-tight">
                      {badge.name}
                    </h3>
                    <p className="text-[9px] text-center line-clamp-2 text-white/30 leading-tight">
                      {badge.description}
                    </p>
                    <p className={`text-[9px] text-center mt-2 font-semibold uppercase tracking-[0.09em] ${rarityTextStyle}`}>
                      {unlocked ? (badge.rarity || "Common") : "Locked"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── IMPOSTAZIONI ── */}
        <p className={`${PROFILE_SECTION_TITLE_CLASS} mb-3`}>Impostazioni</p>
        <div className="rounded-xl border border-white/[0.07] bg-[#0a0a0a] overflow-hidden mb-8">
          {[
            { href: "/settings",           label: "Account e preferenze",
              icon: <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /> },
            { href: "/legal/terms",        label: "Termini di servizio",
              icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></> },
            { href: "/legal/privacy",      label: "Privacy policy",
              icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></> },
            { href: "/legal/content-rules", label: "Regole contenuti",
              icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
            { href: "/legal/credits",      label: "Disclaimer crediti",
              icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></> },
          ].map((item, idx, arr) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${PROFILE_DOCUMENT_LINK_CLASS}${idx < arr.length - 1 ? " border-b border-white/[0.05]" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg border border-white/[0.07] bg-white/[0.02] flex items-center justify-center shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/35" aria-hidden>
                    {item.icon}
                  </svg>
                </div>
                <span className="text-sm font-medium text-white/70">{item.label}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                className="text-white/20 group-hover:text-white/45 motion-reduce:translate-x-0 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
