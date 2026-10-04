import { useEffect, useState } from 'react';
import { fetchHealth } from './api/client';

type ApiStatus = 'checking' | 'ok' | 'degraded' | 'unreachable';

export function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [apiVersion, setApiVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHealth()
      .then((health) => {
        if (cancelled) return;
        setApiStatus(health.status);
        setApiVersion(health.version);
      })
      .catch(() => {
        if (!cancelled) setApiStatus('unreachable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="shell">
      <header className="hero">
        <h1 data-testid="app-title">Dungeon Booking</h1>
        <p className="tagline">Book escape rooms and board-game tables without the chaos.</p>
      </header>
      <section className="status" aria-live="polite">
        <span className="label">API</span>
        <span data-testid="api-status" data-status={apiStatus} className={`pill pill-${apiStatus}`}>
          {apiStatus}
        </span>
        {apiVersion && (
          <span data-testid="api-version" className="muted">
            v{apiVersion}
          </span>
        )}
      </section>
    </main>
  );
}
