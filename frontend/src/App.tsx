/**
 * App.tsx
 *
 * Root component — composes Providers (Redux, React Query, Router)
 * around the centralised AppRouter.
 *
 * Keep this file tiny. All routing lives in app/router.tsx,
 * all providers in app/providers.tsx.
 */

import { useEffect }  from 'react';
import { Providers }  from './app/providers';
import { AppRouter }  from './app/router';
import { apiClient }  from './lib/axios';

// Ping backend on load so Render wakes up before the user tries to log in
function WakeUpBackend() {
  useEffect(() => {
    apiClient.get('/health').catch(() => {});
  }, []);
  return null;
}

export default function App() {
  return (
    <Providers>
      <WakeUpBackend />
      <AppRouter />
    </Providers>
  );
}
