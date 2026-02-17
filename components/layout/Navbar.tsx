'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link href="/" className="navbar-logo">
            Prediction Market
          </Link>
          <div className="navbar-right">
            <div className="navbar-links">
              <Link
                href="/"
                className={pathname === '/' ? 'active' : ''}
              >
                Home
              </Link>
              <Link href="/eventi">Eventi</Link>
              <Link href="/leaderboard">Classifica</Link>
              <Link href="/missioni">Missioni</Link>
              <Link href="/wallet">Wallet</Link>
            </div>
            <NotificationBell />
          </div>
        </div>
      </div>
      <style jsx>{`
        .navbar {
          background: var(--color-bg);
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
        }
        .navbar-logo {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-primary);
          text-decoration: none;
        }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .navbar-links {
          display: flex;
          gap: 1.5rem;
        }
        .navbar-links a {
          color: var(--color-text);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .navbar-links a:hover,
        .navbar-links a.active {
          color: var(--color-primary);
        }
        @media (max-width: 768px) {
          .navbar-links {
            gap: 1rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </nav>
  );
}
