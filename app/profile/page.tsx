"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import { trackView } from "@/lib/analytics-client";
import {
  SectionContainer,
  Card,
  LoadingBlock,
} from "@/components/ui";

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

/** Badge sbloccati: blu sfumato più vivo, contorno verde su tutto il box */
const UNLOCKED_BADGE_STYLE =
  "bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900/60 dark:to-sky-800/50 border-2 border-green-500 dark:border-green-400 shadow-sm";

/** Badge ancora da sbloccare: blu leggero sfumato, più tenue degli sbloccati */
const LOCKED_BADGE_STYLE =
  "bg-gradient-to-br from-blue-50 to-sky-50/90 dark:from-blue-950/50 dark:to-sky-950/40 border border-blue-200/70 dark:border-blue-800/50";

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
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
      if (!response.ok) throw new Error("Errore nel caricamento del profilo");
      const data: ProfileStats = await response.json();
      setProfileData(data);
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Errore nel caricamento dei dati del profilo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      trackView("PROFILE_VIEWED", { userId: session?.user?.id });
      fetchProfileData();
      fetchAllBadges();
    }
  }, [status, router, session?.user?.id]);

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
      <div className="min-h-screen bg-bg">
        <Header />
        <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
          <LoadingBlock message="Caricamento profilo..." />
        </main>
      </div>
    );
  }

  if (!session || !profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-ds-body-sm">
            {error}
          </div>
        )}

        {/* Mini box: nome, streak, data iscrizione */}
        <Card className="p-4 md:p-5 mb-6 relative">
          <button
            type="button"
            onClick={openEditModal}
            className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium bg-black/25 dark:bg-white/10 border border-blue-400 text-white shadow-[0_0_8px_rgba(96,165,250,0.35)] hover:shadow-[0_0_12px_rgba(96,165,250,0.5)] transition-shadow"
          >
            Modifica
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-accent-700 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden">
              {profileData.user.image ? (
                <img src={profileData.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                (displayName[0] || "?").toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1 pr-20">
              <h1 className="text-lg md:text-xl font-bold text-fg truncate">{displayName}</h1>
              <span className="text-fg-muted text-sm font-normal">— 🔥 {profileData.stats.streak} giorni</span>
              <p className="text-fg-muted text-xs mt-0.5">Membro dal {formatDate(profileData.user.createdAt)}</p>
            </div>
          </div>
        </Card>

        {/* Modal Modifica profilo */}
        {editModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onClick={() => !editSaving && setEditModalOpen(false)}
          >
            <div
              className="bg-bg border border-border dark:border-white/10 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-border dark:border-white/10">
                <h2 id="edit-profile-title" className="text-lg font-bold text-fg">
                  Modifica profilo
                </h2>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent-700 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shrink-0">
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (editUsername[0] || "?").toUpperCase()
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        handlePhotoFile(f ?? null);
                        e.target.value = "";
                      }}
                      aria-label="Scatta foto"
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        handlePhotoFile(f ?? null);
                        e.target.value = "";
                      }}
                      aria-label="Scegli dalla galleria"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex-1 py-2.5 rounded-xl border border-border dark:border-white/20 bg-surface/50 text-fg text-sm font-medium hover:bg-surface transition-colors"
                    >
                      📷 Scatta foto
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex-1 py-2.5 rounded-xl border border-border dark:border-white/20 bg-surface/50 text-fg text-sm font-medium hover:bg-surface transition-colors"
                    >
                      🖼️ Galleria
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-username" className="block text-sm font-medium text-fg mb-1">
                    Nome utente
                  </label>
                  <input
                    id="edit-username"
                    type="text"
                    value={editUsername}
                    onChange={(e) => {
                      setEditUsername(e.target.value);
                      setEditError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveProfile();
                      if (e.key === "Escape") setEditModalOpen(false);
                    }}
                    placeholder="Username"
                    className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-white/20 bg-bg text-fg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={editSaving}
                    aria-invalid={!!editError}
                  />
                </div>
                {editError && (
                  <p className="text-sm text-red-500 dark:text-red-400" role="alert">
                    {editError}
                  </p>
                )}
              </div>
              <div className="p-5 pt-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border dark:border-white/20 text-fg font-medium hover:bg-surface/50 transition-colors disabled:opacity-50"
                  disabled={editSaving}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={editSaving}
                >
                  {editSaving ? "Salvataggio…" : "Salva"}
                </button>
              </div>
            </div>
          </div>
        )}

        <SectionContainer title="Statistiche">
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            <StatsCard
              title="ROI"
              value={`${profileData.stats.roi >= 0 ? "+" : ""}${formatPercentage(profileData.stats.roi)}`}
              icon="📈"
              color={profileData.stats.roi >= 0 ? "green" : "red"}
              subtitle="Ritorno investimento"
            />
            <StatsCard
              title="Precisione"
              value={formatPercentage(profileData.stats.accuracy)}
              icon="🎯"
              color="blue"
              subtitle={`${profileData.stats.correctPredictions}/${profileData.stats.totalPredictions}`}
            />
            <StatsCard
              title="Previsioni totali"
              value={profileData.stats.totalPredictions}
              icon="🔮"
              color="purple"
              subtitle={`${profileData.stats.activePredictions} attive`}
            />
            <Link href="/discover?tab=seguiti#creati" className="block rounded-2xl hover:opacity-95 transition-opacity">
              <StatsCard
                title="Eventi creati"
                value={profileData.stats.eventsCreatedCount ?? 0}
                icon="📋"
                color="blue"
                subtitle="Eventi che hai pubblicato"
              />
            </Link>
          </div>
        </SectionContainer>

        <SectionContainer title="Badge">
          <Card className="p-5 md:p-6">
            {allBadges.length === 0 ? (
              <p className="text-fg-muted text-sm text-center py-6">
                Completa missioni e previsioni per sbloccare badge.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allBadges.map((badge) => {
                  const unlocked = badge.unlocked;
                  return (
                    <div
                      key={badge.id}
                      className={`relative p-4 rounded-2xl transition-all ${
                        unlocked ? UNLOCKED_BADGE_STYLE : LOCKED_BADGE_STYLE
                      }`}
                    >
                      {!unlocked && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-200/50 dark:bg-blue-800/50 flex items-center justify-center" title="Da sbloccare">
                          <span className="text-xs" aria-hidden>🔒</span>
                        </div>
                      )}
                      <div className="text-2xl mb-1 text-center">
                        {badge.icon || "🏆"}
                      </div>
                      <h3 className={`font-semibold text-center text-sm mb-0.5 ${unlocked ? "text-fg" : "text-slate-800 dark:text-slate-200"}`}>
                        {badge.name}
                      </h3>
                      <p className={`text-[10px] text-center line-clamp-2 ${unlocked ? "text-fg-muted" : "text-slate-600 dark:text-slate-400"}`}>
                        {badge.description}
                      </p>
                      <p
                        className={`text-[10px] text-center mt-2 font-medium ${
                          unlocked ? "text-success dark:text-success" : "text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {unlocked ? "✓ Sbloccato" : "Da sbloccare"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </SectionContainer>

        <SectionContainer title="Impostazioni">
          <Card className="p-3 md:p-4 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-sm">
            <ul className="space-y-0 divide-y divide-border/80 dark:divide-white/10">
              <li>
                <Link
                  href="/settings"
                  className="flex items-center justify-between py-2.5 text-sm text-fg hover:text-primary transition-colors ds-tap-target"
                >
                  <span className="font-medium">Account e preferenze</span>
                  <span className="text-fg-muted text-xs" aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="flex items-center justify-between py-2.5 text-sm text-fg-muted hover:text-fg transition-colors ds-tap-target"
                >
                  <span>Termini di servizio</span>
                  <span className="text-xs" aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="flex items-center justify-between py-2.5 text-sm text-fg-muted hover:text-fg transition-colors ds-tap-target"
                >
                  <span>Privacy policy</span>
                  <span className="text-xs" aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/content-rules"
                  className="flex items-center justify-between py-2.5 text-sm text-fg-muted hover:text-fg transition-colors ds-tap-target"
                >
                  <span>Regole contenuti</span>
                  <span className="text-xs" aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/credits"
                  className="flex items-center justify-between py-2.5 text-sm text-fg-muted hover:text-fg transition-colors ds-tap-target"
                >
                  <span>Disclaimer crediti</span>
                  <span className="text-xs" aria-hidden>→</span>
                </Link>
              </li>
            </ul>
          </Card>
        </SectionContainer>
      </main>
    </div>
  );
}
