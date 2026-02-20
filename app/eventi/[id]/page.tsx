'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { EventHero } from '@/components/events/EventHero';
import { CommunitySplit } from '@/components/events/CommunitySplit';
import { StickyVoteBar } from '@/components/events/StickyVoteBar';
import { YourPickSection } from '@/components/events/YourPickSection';
import { MiniLeaderboard } from '@/components/events/MiniLeaderboard';
import { ActivityToasts } from '@/components/events/ActivityToasts';
import { CommentsSection } from '@/components/events/CommentsSection';
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

interface LeaderboardEntry {
  rank: number;
  nickname: string;
  points?: number;
  accuracy?: number;
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [voteIntent, setVoteIntent] = useState<'yes' | 'no' | null>(null);

  // Fetch event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        setIsLoading(true);
        // TODO: Sostituire con chiamata API reale
        // const response = await fetch(`/api/events/${eventId}`);
        // const data = await response.json();

        // Mock data per sviluppo
        const mockEvent: Event = {
          id: eventId || '1',
          title: 'Bitcoin supererà $100k entro fine anno?',
          description:
            'Il prezzo di Bitcoin continuerà a salire raggiungendo la soglia psicologica dei 100.000 dollari entro il 31 dicembre 2024? Analizziamo i trend di mercato, l\'adozione istituzionale e i fattori macroeconomici che potrebbero influenzare questa previsione.',
          closesAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          category: 'Crypto',
          velocity: 12,
          participants: 342,
          yesPct: 68,
          noPct: 32,
          pointsMultiplier: 1.5,
          isClosed: false,
        };

        setEvent(mockEvent);
      } catch (err) {
        console.error('Errore nel caricamento evento:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setIsLeaderboardLoading(true);
        // TODO: Sostituire con chiamata API reale
        // const response = await fetch(`/api/events/${eventId}/leaderboard`);
        // const data = await response.json();

        // Mock data per sviluppo
        const mockLeaderboard: LeaderboardEntry[] = [
          { rank: 1, nickname: 'CryptoMaster', points: 1250, accuracy: 87 },
          { rank: 2, nickname: 'TechGuru', points: 980, accuracy: 82 },
          { rank: 3, nickname: 'PredictionPro', points: 875, accuracy: 79 },
          { rank: 4, nickname: 'TraderX', points: 720, accuracy: 75 },
          { rank: 5, nickname: 'AnalystY', points: 650, accuracy: 73 },
        ];

        setLeaderboard(mockLeaderboard);
      } catch (err) {
        console.error('Errore nel caricamento leaderboard:', err);
      } finally {
        setIsLeaderboardLoading(false);
      }
    }

    if (eventId) {
      fetchLeaderboard();
    }
  }, [eventId]);

  // Fetch user vote
  useEffect(() => {
    async function fetchUserVote() {
      if (!isAuthenticated || !eventId) return;

      try {
        // TODO: Sostituire con chiamata API reale
        // const response = await fetch(`/api/events/${eventId}/my-vote`);
        // const data = await response.json();
        // setUserVote(data.vote);

        // Mock: per ora non c'è voto
        setUserVote(null);
      } catch (err) {
        console.error('Errore nel caricamento voto utente:', err);
      }
    }

    fetchUserVote();
  }, [isAuthenticated, eventId]);

  const handleVote = useCallback(
    async (vote: 'yes' | 'no') => {
      if (!isAuthenticated) {
        setVoteIntent(vote);
        setAuthModalOpen(true);
        return;
      }

      try {
        // TODO: Chiamata API reale
        // await fetch(`/api/events/${eventId}/vote`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ vote }),
        // });

        console.log('Voto registrato:', { eventId, vote });
        setUserVote(vote);
        
        // Aggiorna le percentuali localmente (in produzione verrà dal backend)
        if (event) {
          setEvent({
            ...event,
            participants: event.participants + 1,
            yesPct: vote === 'yes' 
              ? Math.round((event.yesPct * event.participants + 100) / (event.participants + 1))
              : Math.round((event.yesPct * event.participants) / (event.participants + 1)),
            noPct: vote === 'no'
              ? Math.round((event.noPct * event.participants + 100) / (event.participants + 1))
              : Math.round((event.noPct * event.participants) / (event.participants + 1)),
          });
        }
      } catch (err) {
        console.error('Errore nel registrare il voto:', err);
        alert('Errore nel registrare il voto. Riprova.');
      }
    },
    [isAuthenticated, eventId, event]
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
      handleVote(voteIntent);
      setVoteIntent(null);
    }
  }, [isAuthenticated, voteIntent, handleVote]);

  if (isLoading) {
    return (
      <div className="event-detail-page">
        <div className="container">
          <div className="loading-state">
            <p>Caricamento evento...</p>
          </div>
        </div>
        <style jsx>{`
          .event-detail-page {
            min-height: 100vh;
            padding-top: 2rem;
            padding-bottom: 6rem;
          }

          .loading-state {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--color-text-light);
          }
        `}</style>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail-page">
        <div className="container">
          <div className="error-state">
            <p>Evento non trovato</p>
          </div>
        </div>
        <style jsx>{`
          .event-detail-page {
            min-height: 100vh;
            padding-top: 2rem;
            padding-bottom: 6rem;
          }

          .error-state {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--color-danger);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <div className="container">
        <EventHero event={event} />
        <CommunitySplit yesPct={event.yesPct} noPct={event.noPct} participants={event.participants} />
        <YourPickSection 
          userVote={userVote} 
          isAuthenticated={isAuthenticated}
          pointsMultiplier={event.pointsMultiplier}
        />
        <MiniLeaderboard entries={leaderboard} isLoading={isLeaderboardLoading} />
        <CommentsSection eventId={event.id} />
      </div>

      <StickyVoteBar
        isAuthenticated={isAuthenticated}
        isClosed={event.isClosed}
        onVote={handleVote}
        onAuthRequired={handleAuthRequired}
      />

      <ActivityToasts />

      <AuthGateModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setVoteIntent(null);
        }}
        onLogin={handleLogin}
        onSignup={handleSignup}
        voteIntent={voteIntent ? { eventId: event.id, vote: voteIntent } : null}
      />

      <style jsx>{`
        .event-detail-page {
          min-height: 100vh;
          padding-top: 2rem;
          padding-bottom: 6rem; /* Spazio per sticky vote bar su mobile */
        }

        @media (min-width: 769px) {
          .event-detail-page {
            padding-bottom: 3rem;
          }
        }
      `}</style>
    </div>
  );
}
