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
      Sport: "bg-green-100 text-green-800",
      Politica: "bg-blue-100 text-blue-800",
      Tecnologia: "bg-purple-100 text-purple-800",
      Economia: "bg-yellow-100 text-yellow-800",
      Cultura: "bg-pink-100 text-pink-800",
      Altro: "bg-gray-100 text-gray-800",
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Caricamento evento...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Evento non trovato</p>
            <Link
              href="/"
              className="mt-4 text-blue-600 hover:text-blue-700 inline-block"
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Torna agli eventi
        </Link>

        {/* Event Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                    event.category
                  )}`}
                >
                  {event.category}
                </span>
                {event.resolved && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.outcome === "YES"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    Risolto: {event.outcome === "YES" ? "SÌ" : "NO"}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-gray-600 text-lg mb-4">{event.description}</p>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {event.probability.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">prevede SÌ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {event._count.predictions}
                  </div>
                  <div className="text-xs text-gray-500">previsioni</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {event.totalCredits.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">crediti totali</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    Chiude tra: {getTimeRemaining()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Probability Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Distribuzione crediti
              </span>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-medium">
                  SÌ: {event.yesCredits.toLocaleString()} ({event.yesPredictions})
                </span>
                <span className="text-red-600 font-medium">
                  NO: {event.noCredits.toLocaleString()} ({event.noPredictions})
                </span>
              </div>
            </div>
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="bg-green-600 h-full transition-all flex items-center justify-center text-white text-xs font-medium"
                style={{
                  width: `${
                    event.totalCredits > 0
                      ? (event.yesCredits / event.totalCredits) * 100
                      : 50
                  }%`,
                }}
              >
                {event.totalCredits > 0 &&
                  (event.yesCredits / event.totalCredits) * 100 > 10 &&
                  `${((event.yesCredits / event.totalCredits) * 100).toFixed(0)}%`}
              </div>
              <div
                className="bg-red-600 h-full transition-all flex items-center justify-center text-white text-xs font-medium"
                style={{
                  width: `${
                    event.totalCredits > 0
                      ? (event.noCredits / event.totalCredits) * 100
                      : 50
                  }%`,
                }}
              >
                {event.totalCredits > 0 &&
                  (event.noCredits / event.totalCredits) * 100 > 10 &&
                  `${((event.noCredits / event.totalCredits) * 100).toFixed(0)}%`}
              </div>
            </div>
          </div>

          {/* User Prediction Display */}
          {userPrediction && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                userPrediction.resolved
                  ? userPrediction.won
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-red-50 border-2 border-red-200"
                  : "bg-blue-50 border-2 border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    La tua previsione
                  </h3>
                  <p className="text-sm text-gray-600">
                    {userPrediction.outcome === "YES" ? "SÌ" : "NO"} -{" "}
                    {userPrediction.credits.toLocaleString()} crediti
                  </p>
                  {userPrediction.resolved && (
                    <p
                      className={`text-sm font-medium mt-1 ${
                        userPrediction.won ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {userPrediction.won
                        ? `✓ Hai vinto! Payout: ${userPrediction.payout?.toLocaleString()} crediti`
                        : "✗ Hai perso"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prediction Buttons */}
          {canMakePrediction && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowPredictionModal(true)}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Fai una Previsione
              </button>
            </div>
          )}

          {!session && !event.resolved && new Date(event.closesAt) > new Date() && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <Link href="/auth/login" className="font-medium underline">
                  Accedi
                </Link>{" "}
                per fare una previsione su questo evento
              </p>
            </div>
          )}

          {/* Event Info */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>
              Creato da: {event.createdBy.name || "Utente"} il{" "}
              {new Date(event.createdAt).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p>
              Chiude il{" "}
              {new Date(event.closesAt).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <CommentsSection eventId={event.id} />
      </main>

      {/* Prediction Modal */}
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
