import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute  from '../routes/PrivateRoute';
import PublicRoute   from '../routes/PublicRoute';
import PageLoader    from '../components/shared/PageLoader';

// ── Layouts ───────────────────────────────────────────────────────────────────
import { AppLayout }  from '../layouts';
import { AuthLayout } from '../layouts/AuthLayout';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const LoginPage                = lazy(() => import('../pages/LoginPage'));
const RegisterPage             = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage       = lazy(() => import('../pages/ForgotPasswordPage'));
const ContactPage              = lazy(() => import('../pages/ContactPage'));
const DashboardPage            = lazy(() => import('../pages/DashboardPage'));
const KanbanPage               = lazy(() => import('../pages/KanbanPage'));
const TeamPage                 = lazy(() => import('../pages/TeamPage'));
const SettingsPage             = lazy(() => import('../pages/SettingsPage'));
const AccountInfoPage          = lazy(() => import('../pages/AccountInfoPage'));
const TimelinePage             = lazy(() => import('../pages/TimelinePage'));
const CalendarPage             = lazy(() => import('../pages/CalendarPage'));
const StickyNotesPage          = lazy(() => import('../pages/StickyNotesPage'));
const NotebookPage             = lazy(() => import('../pages/NotebookPage'));
const HabitTrackerPage         = lazy(() => import('../pages/HabitTrackerPage'));
const SmartWorkPage            = lazy(() => import('../pages/SmartWorkPage'));
const ContactSubmissionsPage   = lazy(() => import('../pages/ContactSubmissionsPage'));
const DataExportPage           = lazy(() => import('../pages/DataExportPage'));
const PomodoroPage             = lazy(() => import('../pages/PomodoroPage'));
const ProductivityScorePage    = lazy(() => import('../pages/ProductivityScorePage'));
const NotFoundPage             = lazy(() => import('../pages/NotFoundPage'));

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

        {/* ── Fully public (no auth check) ───────────────────────────── */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/contact"         element={<ContactPage />} />

        {/* ── Private (authenticated only) ───────────────────────────── */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/boards"       element={<KanbanPage />} />
            <Route path="/board/:boardId" element={<KanbanPage />} />
            <Route path="/team"         element={<TeamPage />} />
            <Route path="/settings"     element={<SettingsPage />} />
            <Route path="/account"      element={<AccountInfoPage />} />
            <Route path="/timeline"     element={<TimelinePage />} />
            <Route path="/calendar"     element={<CalendarPage />} />
            <Route path="/sticky-notes" element={<StickyNotesPage />} />
            <Route path="/notebook"     element={<NotebookPage />} />
            <Route path="/habits"       element={<HabitTrackerPage />} />
            <Route path="/smart-work"   element={<SmartWorkPage />} />
            <Route path="/contacts"     element={<ContactSubmissionsPage />} />
            <Route path="/export"       element={<DataExportPage />} />
            <Route path="/pomodoro"     element={<PomodoroPage />} />
            <Route path="/productivity" element={<ProductivityScorePage />} />
          </Route>
        </Route>

        {/* ── Redirects ──────────────────────────────────────────────── */}
        <Route path="/"   element={<Navigate to="/dashboard" replace />} />
        <Route path="*"   element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  );
}
