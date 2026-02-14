"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import PredictionModal from "@/components/PredictionModal";
import CommentsSection from "@/components/CommentsSection";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  closesAt: string;
  resolved: boolean;
  outcome: "YES" | "NO" | null;
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

  useEffect(() => {
    if (params?.id) {
      fetchEvent();
      if (session?.user?.id) {
        fetchUserCredits();
      }
    }
  }, [params?.id, session]);

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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Sport: "bg-emerald-100 text-emerald-800",
      Politica: "bg-sky-100 text-sky-800",
      Tecnologia: "bg-violet-100 text-violet-800",
      Economia: "bg-amber-100 text-amber-800",
      Cultura: "bg-pink-100 text-pink-800",
      Altro: "bg-slate-100 text-slate-800",
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
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-accent-500 border-t-transparent" />
            <p className="mt-4 text-slate-600 font-medium">Caricamento evento...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">Evento non trovato</p>
            <Link
              href="/"
              className="mt-4 text-accent-600 hover:text-accent-700 font-semibold inline-block focus-visible:underline"
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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-2xl pb-8">
        {/* Back - touch-friendly */}
        <Link
          href="/"
          className="inline-flex items-center min-h-[44px] text-slate-600 hover:text-slate-900 mb-4 rounded-xl focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        >
          <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Eventi</span>
        </Link>

        {/* Card evento */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 md:p-8 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
            {event.resolved && (
              <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${event.outcome === "YES" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                Risolto: {event.outcome === "YES" ? "SÌ" : "NO"}
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight">
            {event.title}
          </h1>
          {event.description && (
            <p className="text-slate-600 text-base md:text-lg mb-6">{event.description}</p>
          )}

          {/* Stats - grid su mobile */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 py-4 border-y border-slate-100 mb-6">
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-slate-900">{event.probability.toFixed(1)}%</div>
              <div className="text-xs text-slate-500">prevede SÌ</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-slate-900">{event._count.predictions}</div>
              <div className="text-xs text-slate-500">previsioni</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl md:text-2xl font-bold text-slate-900">{event.totalCredits.toLocaleString()}</div>
              <div className="text-xs text-slate-500">crediti</div>
            </div>
            <div className="text-center md:text-left col-span-2 md:col-span-1">
              <div className="text-sm font-medium text-slate-600">Chiude tra {getTimeRemaining()}</div>
            </div>
          </div>

          {/* Barra SÌ/NO */}
          <div className="mb-6">
            <div className="flex justify-between text-xs md:text-sm font-medium text-slate-600 mb-2">
              <span>SÌ {event.yesCredits.toLocaleString()} ({event.yesPredictions})</span>
              <span>NO {event.noCredits.toLocaleString()} ({event.noPredictions})</span>
            </div>
            <div className="w-full h-3 md:h-4 bg-slate-200 rounded-full overflow-hidden flex">
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

          {/* La tua previsione */}
          {userPrediction && (
            <div className={`p-4 rounded-2xl mb-6 ${
              userPrediction.resolved
                ? userPrediction.won ? "bg-emerald-50 border-2 border-emerald-200" : "bg-red-50 border-2 border-red-200"
                : "bg-accent-50 border-2 border-accent-200"
            }`}>
              <h3 className="font-semibold text-slate-900 mb-1">La tua previsione</h3>
              <p className="text-sm text-slate-600">
                {userPrediction.outcome === "YES" ? "SÌ" : "NO"} — {userPrediction.credits.toLocaleString()} crediti
              </p>
              {userPrediction.resolved && (
                <p className={`text-sm font-semibold mt-1 ${userPrediction.won ? "text-emerald-700" : "text-red-700"}`}>
                  {userPrediction.won ? `✓ Vittoria: +${userPrediction.payout?.toLocaleString()} crediti` : "✗ Persa"}
                </p>
              )}
            </div>
          )}

          {/* CTA Previsione */}
          {canMakePrediction && (
            <button
              type="button"
              onClick={() => setShowPredictionModal(true)}
              className="w-full min-h-[52px] py-4 bg-accent-500 text-white rounded-2xl font-semibold text-lg hover:bg-accent-600 active:bg-accent-700 transition-colors shadow-glow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
            >
              Fai una Previsione
            </button>
          )}

          {!session && !event.resolved && new Date(event.closesAt) > new Date() && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
              <Link href="/auth/login" className="font-semibold underline">Accedi</Link> per scommettere
            </div>
          )}

          <div className="text-sm text-slate-500 mt-6 space-y-1">
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
