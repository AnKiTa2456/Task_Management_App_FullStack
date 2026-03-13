/**
 * App.tsx
 *
 * Root component — composes Providers (Redux, React Query, Router)
 * around the centralised AppRouter.
 *
 * Keep this file tiny. All routing lives in app/router.tsx,
 * all providers in app/providers.tsx.
 */

import { Providers }  from './app/providers';
import { AppRouter }  from './app/router';

export default function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}
