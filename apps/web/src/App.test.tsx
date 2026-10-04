import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

function mockHealth(status: 'ok' | 'degraded', httpStatus = 200) {
  const body = {
    status,
    version: '0.1.0',
    environment: 'test',
    timestamp: new Date().toISOString(),
    checks: { database: status === 'ok' ? 'up' : 'down' },
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: httpStatus })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('shows the product name', () => {
    mockHealth('ok');
    render(<App />);
    expect(screen.getByTestId('app-title')).toHaveTextContent('Dungeon Booking');
  });

  it('shows the API status once the health check answers', async () => {
    mockHealth('ok');
    render(<App />);
    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(screen.getByTestId('api-version')).toHaveTextContent('v0.1.0');
  });

  it('shows "unreachable" when the API cannot be contacted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('network error');
      }),
    );
    render(<App />);
    expect(await screen.findByText('unreachable')).toBeInTheDocument();
  });
});
