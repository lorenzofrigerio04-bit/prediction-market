"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

interface Mission {
  id: string;
  missionId: string;
  name: string;
  description: string;
  type: string;
  target: number;
  reward: number;
  period: string;
  progress: number;
  completed: boolean;
  completedAt: string | null;
  periodStart: string;
}

interface MissionsResponse {
  missions: Mission[];
  daily: Mission[];
  weekly: Mission[];
}

const PERIOD_LABELS: Record<string, string> = {
  DAILY: "Giornaliera",
  WEEKLY: "Settimanale",
};

const TYPE_ICONS: Record<string, string> = {
  MAKE_PREDICTIONS: "🎯",
  WIN_PREDICTIONS: "🏆",
  DAILY_LOGIN: "🎁",
};

export default function MissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<MissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetchMissions();
    }
  }, [status, router]);

  const fetchMissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/missions");
      if (!res.ok) throw new Error("Errore nel caricamento delle missioni");
      const json: MissionsResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Errore nel caricamento delle missioni");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("it-IT").format(n);

  const MissionCard = ({ m }: { m: Mission }) => {
    const pct = m.target > 0 ? Math.min(100, (m.progress / m.target) * 100) : 0;
    const icon = TYPE_ICONS[m.type] ?? "📋";
    return (
      <div
        className={`rounded-xl border-2 p-5 transition-colors ${
          m.completed
            ? "border-green-300 bg-green-50"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900">{m.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                  {PERIOD_LABELS[m.period] ?? m.period}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{m.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[180px]">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {m.progress}/{m.target}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-green-600">+{formatAmount(m.reward)}</p>
            <p className="text-xs text-gray-500">crediti</p>
            {m.completed && (
              <p className="mt-2 text-xs font-medium text-green-600">✓ Completata</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600">Caricamento missioni...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session || !data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Missioni</h1>
          <p className="text-gray-600">
            Completa le missioni per guadagnare crediti extra. Le missioni giornaliere si
            resettano a mezzanotte, quelle settimanali il lunedì.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📅</span> Missioni giornaliere
          </h2>
          {data.daily.length === 0 ? (
            <p className="text-gray-500">Nessuna missione giornaliera attiva.</p>
          ) : (
            <div className="space-y-4">
              {data.daily.map((m) => (
                <MissionCard key={m.id} m={m} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📆</span> Missioni settimanali
          </h2>
          {data.weekly.length === 0 ? (
            <p className="text-gray-500">Nessuna missione settimanale attiva.</p>
          ) : (
            <div className="space-y-4">
              {data.weekly.map((m) => (
                <MissionCard key={m.id} m={m} />
              ))}
            </div>
          )}
        </section>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Come funziona</h2>
          <ul className="text-gray-600 space-y-2 text-sm">
            <li>• <strong>Previsioni:</strong> fai previsioni sugli eventi per avanzare.</li>
            <li>• <strong>Vincite:</strong> quando un evento viene risolto e hai indovinato, conta per le missioni &quot;Vinci X previsioni&quot;.</li>
            <li>• <strong>Login giornaliero:</strong> riscatta il bonus giornaliero nel <Link href="/wallet" className="text-blue-600 hover:underline focus-visible:underline rounded">Wallet</Link>.</li>
            <li>• Le ricompense vengono accreditate automaticamente al completamento.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
