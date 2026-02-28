'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
  voteIntent?: {
    eventId: string;
    vote: 'yes' | 'no';
  } | null;
}

export function AuthGateModal({
  isOpen,
  onClose,
  onLogin,
  onSignup,
  voteIntent,
}: AuthGateModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      queueMicrotask(() => setIsClosing(false));
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`auth-modal-backdrop ${isClosing ? 'closing' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className={`auth-modal-content ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="auth-modal-close"
          onClick={handleClose}
          aria-label="Chiudi modale"
        >
          ×
        </button>

        <h2 id="auth-modal-title" className="auth-modal-title">
          Accedi per votare
        </h2>

        {voteIntent && (
          <p className="auth-modal-description">
            Devi essere autenticato per votare su questo evento. Dopo il login,
            il tuo voto verrà registrato automaticamente.
          </p>
        )}

        <div className="auth-modal-actions">
          <Link
            href="/login"
            className="auth-button auth-button-primary"
            onClick={(e) => {
              e.preventDefault();
              onLogin();
            }}
          >
            Accedi
          </Link>
          <Link
            href="/signup"
            className="auth-button auth-button-secondary"
            onClick={(e) => {
              e.preventDefault();
              onSignup();
            }}
          >
            Registrati
          </Link>
        </div>

        <style jsx>{`
          .auth-modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
            opacity: 1;
            transition: opacity 0.2s;
          }

          .auth-modal-backdrop.closing {
            opacity: 0;
          }

          .auth-modal-content {
            background: var(--color-bg);
            border-radius: var(--radius-lg);
            padding: 2rem;
            max-width: 400px;
            width: 100%;
            position: relative;
            box-shadow: var(--shadow-lg);
            transform: scale(1);
            transition: transform 0.2s;
          }

          .auth-modal-content.closing {
            transform: scale(0.95);
          }

          .auth-modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 2rem;
            line-height: 1;
            color: var(--color-text-light);
            cursor: pointer;
            padding: 0;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius);
            transition: all 0.2s;
          }

          .auth-modal-close:hover {
            background: var(--color-bg-secondary);
            color: var(--color-text);
          }

          .auth-modal-close:focus {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
          }

          .auth-modal-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--color-text);
          }

          .auth-modal-description {
            font-size: 0.875rem;
            color: var(--color-text-light);
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }

          .auth-modal-actions {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .auth-button {
            display: block;
            padding: 0.875rem 1.5rem;
            border-radius: var(--radius);
            text-align: center;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }

          .auth-button:focus {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
          }

          .auth-button-primary {
            background: var(--color-primary);
            color: white;
          }

          .auth-button-primary:hover {
            background: var(--color-primary-dark);
          }

          .auth-button-secondary {
            background: var(--color-bg-secondary);
            color: var(--color-text);
            border: 1px solid var(--color-border);
          }

          .auth-button-secondary:hover {
            background: var(--color-border-light);
          }

          @media (max-width: 768px) {
            .auth-modal-content {
              padding: 1.5rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
