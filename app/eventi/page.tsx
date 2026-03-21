'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { EventCardEngagement } from '@/components/events/EventCardEngagement';
import { AuthGateModal } from '@/components/auth/AuthGateModal';

interface Event {
  id: string;
  title: string;
  description: string;
  closesAt: string;
  category: string;
  velocity: number;
  participants: number;
  yesPct: number;
  noPct: number;
  pointsMultiplier: number;
  isClosed?: boolean;
}

/** Mappa la risposta di /api/events al formato usato da EventCardEngagement */
function mapApiEventToEvent(apiEvent: {
  id: string;
  title: string;
  description?: string | null;
  closesAt: Date | string;
  category: string;
  resolved?: boolean;
  probability?: number;
  _count?: { predictions?: number };
  fomo?: { votesVelocity?: number; pointsMultiplier?: number };
}): Event {
  const closesAt = typeof apiEvent.closesAt === 'string' ? apiEvent.closesAt : apiEvent.closesAt?.toISOString?.() ?? '';
  const yesPct = Math.round(apiEvent.probability ?? 50);
  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description ?? '',
    closesAt,
    category: apiEvent.category ?? 'Altro',
    velocity: apiEvent.fomo?.votesVelocity ?? 0,
    participants: apiEvent._count?.predictions ?? 0,
    yesPct,
    noPct: 100 - yesPct,
    pointsMultiplier: apiEvent.fomo?.pointsMultiplier ?? 1,
    isClosed: apiEvent.resolved ?? false,
  };
}

export default function EventiPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrendingOnly, setShowTrendingOnly] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [voteIntent, setVoteIntent] = useState<{
    eventId: string;
    vote: 'yes' | 'no';
  } | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoading(true);
        setError(null);
        const sort = showTrendingOnly ? 'popular' : 'expiring';
        const res = await fetch(`/api/events?status=open&sort=${sort}&page=1&limit=24`);
        if (!res.ok) throw new Error('Errore nel caricamento');
        const data = await res.json();
        const list = (data.events ?? []).map(mapApiEventToEvent);
        setEvents(list);
      } catch (err) {
        console.error('Errore nel caricamento eventi:', err);
        setError(err instanceof Error ? err.message : 'Errore di rete');
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [showTrendingOnly]);

  const handleVote = useCallback(
    async (eventId: string, vote: 'yes' | 'no') => {
      if (!isAuthenticated) {
        setVoteIntent({ eventId, vote });
        setAuthModalOpen(true);
        return;
      }

      try {
        // TODO: Chiamata API reale
        // await fetch('/api/events/' + eventId + '/vote', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ vote }),
        // });

        console.log('Voto registrato:', { eventId, vote });
        // TODO: Aggiornare lo stato locale dell'evento per riflettere il nuovo voto
        // Potresti aggiornare le percentuali yesPct/noPct e participants
      } catch (err) {
        console.error('Errore nel voto:', err);
        alert('Errore nel registrare il voto. Riprova.');
      }
    },
    [isAuthenticated]
  );

  const handleAuthRequired = () => {
    setAuthModalOpen(true);
  };

  const handleLogin = () => {
    setAuthModalOpen(false);
    window.location.href = '/auth/login';
  };

  const handleSignup = () => {
    setAuthModalOpen(false);
    window.location.href = '/auth/signup';
  };

  // Gestione del voto dopo autenticazione
  useEffect(() => {
    if (isAuthenticated && voteIntent) {
      // Riprova il voto dopo il login
      handleVote(voteIntent.eventId, voteIntent.vote);
      setVoteIntent(null);
    }
  }, [isAuthenticated, voteIntent, handleVote]);

  return (
    <div className="eventi-page">
      <div className="container">
        <div className="eventi-header">
          <h1 className="eventi-title">Eventi</h1>
          <label className="trending-toggle">
            <input
              type="checkbox"
              checked={showTrendingOnly}
              onChange={(e) => setShowTrendingOnly(e.target.checked)}
              aria-label="Mostra solo eventi in tendenza"
            />
            <span>Solo trend</span>
          </label>
        </div>

        {isLoading ? (
          <div className="eventi-loading" aria-live="polite">
            <p>Caricamento eventi...</p>
          </div>
        ) : error ? (
          <div className="eventi-empty" role="status">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="retry-btn">
              Riprova
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="eventi-empty" role="status">
            <p>
              {showTrendingOnly
                ? 'Nessun evento in tendenza al momento.'
                : 'Nessun evento disponibile. Genera eventi dalla sezione Admin o esplora le altre pagine.'}
            </p>
            <Link href="/sport" className="eventi-empty-link">
              Vai a Sport →
            </Link>
          </div>
        ) : (
          <div className="eventi-grid" role="list">
            {events.map((event) => (
              <div key={event.id} role="listitem">
                <EventCardEngagement
                  event={event}
                  isAuthenticated={isAuthenticated}
                  onVote={handleVote}
                  onAuthRequired={handleAuthRequired}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <AuthGateModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setVoteIntent(null);
        }}
        onLogin={handleLogin}
        onSignup={handleSignup}
        voteIntent={voteIntent}
      />

      <style jsx>{`
        .eventi-page {
          min-height: 100vh;
          padding-top: 2rem;
          padding-bottom: 3rem;
        }

        .eventi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .eventi-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .trending-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--color-text);
          user-select: none;
        }

        .trending-toggle input[type='checkbox'] {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
          accent-color: var(--color-primary);
        }

        .trending-toggle:focus-within {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
          border-radius: var(--radius);
        }

        .eventi-loading,
        .eventi-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-light);
        }

        .eventi-empty .retry-btn,
        .eventi-empty-link {
          margin-top: 1rem;
          display: inline-block;
          color: var(--color-primary);
          font-weight: 600;
        }
        .eventi-empty-link:hover {
          text-decoration: underline;
        }

        .eventi-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .eventi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .eventi-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
