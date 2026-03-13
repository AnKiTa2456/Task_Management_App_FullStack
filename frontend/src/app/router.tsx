/**
 * app/router.tsx
 *
 * WHAT: Centralised route configuration.
 * WHY:  All routes live in one place — easy to scan, add, or guard.
 *       Route-level code splitting via React.lazy() keeps the initial
 *       bundle small (each page is a separate JS chunk).
 *
 * Pattern:
 *   - Public routes  → redirect to /dashboard if already authenticated
 *   - Private routes → redirect to /login if not authenticated
 *   - Layouts wrap groups of related routes
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute  from '../routes/PrivateRoute';
import PublicRoute   from '../routes/PublicRoute';
import PageLoader    from '../components/shared/PageLoader';

// ── Layouts ───────────────────────────────────────────────────────────────────
import { AppLayout }  from '../layouts';
import { AuthLayout } from '../layouts/AuthLayout';

// ── Lazy-loaded pages  (each becomes its own JS chunk) ────────────────────────
const LoginPage     = lazy(() => import('../pages/LoginPage'));
const RegisterPage  = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const KanbanPage    = lazy(() => import('../pages/KanbanPage'));
const TeamPage      = lazy(() => import('../pages/TeamPage'));
const SettingsPage  = lazy(() => import('../pages/SettingsPage'));
const NotFoundPage  = lazy(() => import('../pages/NotFoundPage'));

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Public (unauthenticated only) ──────────────────────────── */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* ── Private (authenticated only) ───────────────────────────── */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"      element={<DashboardPage />} />
            <Route path="/boards"         element={<KanbanPage />} />
            <Route path="/board/:boardId" element={<KanbanPage />} />
            <Route path="/team"           element={<TeamPage />} />
            <Route path="/settings"       element={<SettingsPage />} />
          </Route>
        </Route>

        {/* ── Redirects ──────────────────────────────────────────────── */}
        <Route path="/"   element={<Navigate to="/dashboard" replace />} />
        <Route path="*"   element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  );
}
