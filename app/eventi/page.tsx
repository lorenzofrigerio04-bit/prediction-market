'use client';

import { useState, useEffect, useCallback } from 'react';
import { EventCardEngagement } from '@/components/events/EventCardEngagement';
import { AuthGateModal } from '@/components/auth/AuthGateModal';

// Mock: in produzione questo verrà da un hook o context
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // TODO: Integrare con sistema di autenticazione reale
  return { isAuthenticated, setIsAuthenticated };
};

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

export default function EventiPage() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        // TODO: Sostituire con chiamata API reale
        // const response = await fetch('/api/events?sort=closing&trendingOnly=' + showTrendingOnly);
        // const data = await response.json();

        // Mock data per sviluppo
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Bitcoin supererà $100k entro fine anno?',
            description:
              'Il prezzo di Bitcoin continuerà a salire raggiungendo la soglia psicologica dei 100.000 dollari entro il 31 dicembre 2024?',
            closesAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            category: 'Crypto',
            velocity: 12,
            participants: 342,
            yesPct: 68,
            noPct: 32,
            pointsMultiplier: 1.5,
          },
          {
            id: '2',
            title: 'OpenAI lancerà GPT-5 nel 2024?',
            description:
              'OpenAI annuncerà e renderà disponibile GPT-5 prima della fine del 2024?',
            closesAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
            category: 'Tech',
            velocity: 8,
            participants: 189,
            yesPct: 45,
            noPct: 55,
            pointsMultiplier: 2.0,
          },
          {
            id: '3',
            title: 'Italia vincerà gli Europei 2024?',
            description:
              'La nazionale italiana di calcio vincerà il campionato europeo 2024?',
            closesAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            category: 'Sport',
            velocity: 5,
            participants: 521,
            yesPct: 72,
            noPct: 28,
            pointsMultiplier: 1.2,
          },
        ];

        // Sort: default "in scadenza" (più vicini alla chiusura prima)
        const sortedEvents = [...mockEvents].sort((a, b) => {
          const aTime = new Date(a.closesAt).getTime();
          const bTime = new Date(b.closesAt).getTime();
          return aTime - bTime;
        });

        // Filter: se "Solo trend", mostra solo eventi con velocity > 5
        const filteredEvents = showTrendingOnly
          ? sortedEvents.filter((e) => e.velocity > 5)
          : sortedEvents;

        setEvents(filteredEvents);
      } catch (err) {
        console.error('Errore nel caricamento eventi:', err);
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
    // TODO: Reindirizzare a pagina login o aprire modal login
    window.location.href = '/login';
  };

  const handleSignup = () => {
    setAuthModalOpen(false);
    // TODO: Reindirizzare a pagina signup o aprire modal signup
    window.location.href = '/signup';
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
        ) : events.length === 0 ? (
          <div className="eventi-empty" role="status">
            <p>
              {showTrendingOnly
                ? 'Nessun evento in tendenza al momento.'
                : 'Nessun evento disponibile al momento.'}
            </p>
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
