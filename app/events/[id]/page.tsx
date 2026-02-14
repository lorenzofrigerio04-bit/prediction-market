"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import PredictionModal from "@/components/PredictionModal";
import CommentsSection from "@/components/CommentsSection";
import { trackView } from "@/lib/analytics-client";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  closesAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  outcome: "YES" | "NO" | null;
  resolutionSourceUrl: string | null;
  resolutionNotes: string | null;
  probability: number;
  totalCredits: number;
  yesCredits: number;
  noCredits: number;
  yesPredictions: number;
  noPredictions: number;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    predictions: number;
    comments: number;
  };
}

interface UserPrediction {
  id: string;
  outcome: "YES" | "NO";
  credits: number;
  resolved: boolean;
  won: boolean | null;
  payout: number | null;
}

interface EventResponse {
  event: EventDetail;
  userPrediction: UserPrediction | null;
  isFollowing?: boolean;
}

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [userPrediction, setUserPrediction] = useState<UserPrediction | null>(
    null
  );
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchEvent();
      if (session?.user?.id) {
        fetchUserCredits();
      }
    }
  }, [params?.id, session]);

  useEffect(() => {
    if (!event) return;
    trackView("EVENT_VIEWED", { eventId: event.id, category: event.category });
    if (event.resolved) {
      trackView("EVENT_RESOLVED_VIEWED", { eventId: event.id });
    }
  }, [event?.id, event?.resolved, event?.category]);

  const fetchEvent = async () => {
    if (!params?.id) return;
    try {
      const response = await fetch(`/api/events/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch event");
      }

      const data: EventResponse = await response.json();
      setEvent(data.event);
      setUserPrediction(data.userPrediction);
      setIsFollowing(data.isFollowing ?? false);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      // We'll need to create an API route for this, but for now we can get it from the session
      // For now, we'll fetch it from a user API endpoint if it exists
      const response = await fetch("/api/user/credits");
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.credits || 0);
      }
    } catch (error) {
      console.error("Error fetching user credits:", error);
    }
  };

  const handlePredictionSuccess = () => {
    fetchEvent();
    if (session?.user?.id) {
      fetchUserCredits();
    }
  };

  const handleFollowToggle = async () => {
    if (!session?.user?.id || !event) return;
    setFollowLoading(true);
    try {
      const response = await fetch(`/api/events/${event.id}/follow`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore");
      setIsFollowing(data.isFollowing);
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/events/${event?.id}` : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: event?.title ?? "Evento",
          url,
          text: event?.title,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(url);
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 2000);
        } catch {
          // ignore
        }
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Sport: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      Politica: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      Tecnologia: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      Economia: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      Cultura: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      Altro: "bg-surface/50 text-fg-muted border-border dark:border-white/10",
    };
    return colors[category] || colors.Altro;
  };

  const getTimeRemaining = () => {
    if (!event) return "";
    const timeUntilClose = new Date(event.closesAt).getTime() - Date.now();
    const hoursUntilClose = Math.floor(timeUntilClose / (1000 * 60 * 60));
    const daysUntilClose = Math.floor(hoursUntilClose / 24);

    if (timeUntilClose <= 0) {
      return "Chiuso";
    }
    if (daysUntilClose > 0) {
      return `${daysUntilClose} ${daysUntilClose === 1 ? "giorno" : "giorni"}`;
    } else if (hoursUntilClose > 0) {
      return `${hoursUntilClose} ${hoursUntilClose === 1 ? "ora" : "ore"}`;
    } else {
      const minutesUntilClose = Math.floor(timeUntilClose / (1000 * 60));
      return `${minutesUntilClose} ${minutesUntilClose === 1 ? "minuto" : "minuti"}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-fg-muted font-medium">Caricamento evento...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <p className="text-fg-muted text-lg">Evento non trovato</p>
            <Link
              href="/"
              className="mt-4 text-primary hover:text-primary-hover font-semibold inline-block focus-visible:underline"
            >
              Torna alla homepage
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const canMakePrediction =
    !event.resolved &&
    new Date(event.closesAt) > new Date() &&
    !userPrediction &&
    session;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-2xl pb-8">
        <Link
          href="/"
          className="inline-flex items-center min-h-[44px] text-fg-muted hover:text-fg mb-4 rounded-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Eventi</span>
        </Link>

        <div className="glass-elevated rounded-3xl p-5 md:p-8 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
            {event.resolved && (
              <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${event.outcome === "YES" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                Risolto: {event.outcome === "YES" ? "SÌ" : "NO"}
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-fg mb-3 leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {session && (
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`min-h-[44px] px-4 py-2 rounded-2xl text-sm font-semibold transition-colors border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                  isFollowing
                    ? "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30"
                    : "glass text-fg-muted border-border dark:border-white/10 hover:text-fg hover:bg-surface/50"
                }`}
              >
                {followLoading ? "..." : isFollowing ? "Non seguire più" : "Segui evento"}
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[44px] px-4 py-2 rounded-2xl text-sm font-semibold glass text-fg-muted border border-border dark:border-white/10 hover:text-fg hover:bg-surface/50 transition-colors inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              aria-label="Condividi"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {shareCopied ? "Link copiato!" : "Condividi"}
            </button>
          </div>

          {event.description && (
            <p className="text-fg-muted text-base md:text-lg mb-6">{event.description}</p>
          )}

          {(event.resolutionNotes || event.resolutionSourceUrl) && (
            <div className="p-4 rounded-2xl mb-6 bg-surface/50 border border-border dark:border-white/10">
              <h3 className="text-sm font-semibold text-fg mb-2">Criteri di risoluzione</h3>
              {event.resolutionNotes && (
                <p className="text-sm text-fg-muted whitespace-pre-wrap mb-2">{event.resolutionNotes}</p>
              )}
              {event.resolutionSourceUrl && (
                <p className="text-sm">
                  Fonte di risoluzione:{" "}
                  <a
                    href={event.resolutionSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover underline font-medium"
                  >
                    {event.resolutionSourceUrl.replace(/^https?:\/\//, "").split("/")[0]}
                  </a>
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 py-4 border-y border-border dark:border-white/10 mb-6">
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-primary">{event.probability.toFixed(1)}%</div>
              <div className="text-xs text-fg-muted">prevede SÌ</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-fg">{event._count.predictions}</div>
              <div className="text-xs text-fg-muted">previsioni</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-primary">{event.totalCredits.toLocaleString()}</div>
              <div className="text-xs text-fg-muted">crediti</div>
            </div>
            <div className="text-center md:text-left col-span-2 md:col-span-1">
              <div className="text-sm font-medium text-fg-muted">
                {event.resolved ? "Risolto" : new Date(event.closesAt) <= new Date() ? "Chiuso" : `Chiude tra ${getTimeRemaining()}`}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs md:text-sm font-medium text-fg-muted mb-2">
              <span>SÌ {event.yesCredits.toLocaleString()} ({event.yesPredictions})</span>
              <span>NO {event.noCredits.toLocaleString()} ({event.noPredictions})</span>
            </div>
            <div className="w-full h-3 md:h-4 bg-surface/50 rounded-full overflow-hidden flex border border-border dark:border-white/10">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${event.totalCredits > 0 ? (event.yesCredits / event.totalCredits) * 100 : 50}%` }}
              />
              <div
                className="bg-red-500 h-full transition-all"
                style={{ width: `${event.totalCredits > 0 ? (event.noCredits / event.totalCredits) * 100 : 50}%` }}
              />
            </div>
          </div>

          {userPrediction && (
            <div className={`p-4 rounded-2xl mb-6 border ${
              userPrediction.resolved
                ? userPrediction.won ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
                : "glass border-primary/30"
            }`}>
              <h3 className="font-semibold text-fg mb-1">La tua previsione</h3>
              <p className="text-sm text-fg-muted">
                {userPrediction.outcome === "YES" ? "SÌ" : "NO"} — <span className="font-semibold text-primary">{userPrediction.credits.toLocaleString()}</span> crediti
              </p>
              {userPrediction.resolved && (
                <p className={`text-sm font-semibold mt-1 ${userPrediction.won ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  {userPrediction.won ? `✓ Vittoria: +${userPrediction.payout?.toLocaleString()} crediti` : "✗ Persa"}
                </p>
              )}
            </div>
          )}

          {event.resolved && (
            <div className="p-4 rounded-2xl mb-6 border bg-surface/50 border-border dark:border-white/10">
              <p className="font-semibold text-fg">
                Previsioni chiuse. Risultato: {event.outcome === "YES" ? "SÌ" : "NO"}.
              </p>
              {event.resolutionSourceUrl && (
                <p className="text-sm text-fg-muted mt-1">
                  Fonte:{" "}
                  <a
                    href={event.resolutionSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover underline"
                  >
                    Vai alla fonte
                  </a>
                </p>
              )}
            </div>
          )}

          {!event.resolved && new Date(event.closesAt) <= new Date() && (
            <div className="p-4 rounded-2xl mb-6 border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium">
              Previsioni chiuse. Risultato: in attesa.
            </div>
          )}

          {canMakePrediction && (
            <button
              type="button"
              onClick={() => setShowPredictionModal(true)}
              className="w-full min-h-[52px] py-4 bg-primary text-white rounded-2xl font-semibold text-lg hover:bg-primary-hover transition-colors shadow-glow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-bg"
            >
              Fai una Previsione
            </button>
          )}

          {!session && !event.resolved && new Date(event.closesAt) > new Date() && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-sm text-amber-700 dark:text-amber-400">
              <Link href="/auth/login" className="font-semibold underline">Accedi</Link> per scommettere
            </div>
          )}

          <div className="text-sm text-fg-muted mt-6 space-y-1">
            <p>Creato da {event.createdBy.name || "Utente"} · {new Date(event.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p>Chiusura: {new Date(event.closesAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>

        <CommentsSection eventId={event.id} />
      </main>

      {showPredictionModal && (
        <PredictionModal
          eventId={event.id}
          eventTitle={event.title}
          isOpen={showPredictionModal}
          onClose={() => setShowPredictionModal(false)}
          onSuccess={handlePredictionSuccess}
          userCredits={userCredits}
        />
      )}
    </div>
  );
}
