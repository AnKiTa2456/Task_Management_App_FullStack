import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setSidebarOpen } from '../../features/ui/uiSlice';
import { cn } from '../../utils/cn';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/boards':       'My Boards',
  '/board':        'Kanban Board',
  '/team':         'Team',
  '/settings':     'Settings',
  '/account':      'Account Info',
  '/timeline':     'Timeline',
  '/calendar':     'Task Calendar',
  '/sticky-notes': 'Sticky Notes',
  '/notebook':     'Notebook',
  '/habits':       'Habit Tracker',
  '/smart-work':   'Smart Work',
  '/contacts':     'Contact Submissions',
  '/export':       'Export Data',
  '/pomodoro':     'Pomodoro Focus',
  '/productivity': 'Productivity Score',
};

export default function AppLayout() {
  const dispatch               = useAppDispatch();
  const { sidebarOpen, theme } = useAppSelector(s => s.ui);
  const location               = useLocation();

  // Sync Redux theme → <html class="dark">
  useEffect(() => {
    const applyDark = (dark: boolean) =>
      document.documentElement.classList.toggle('dark', dark);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyDark(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyDark(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      applyDark(theme === 'dark');
    }
  }, [theme]);

  // Close sidebar by default on small screens
  useEffect(() => {
    if (window.innerWidth < 768) dispatch(setSidebarOpen(false));
  }, []);

  // Handle orientation / resize — re-close sidebar if user shrinks viewport
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 768) dispatch(setSidebarOpen(false));
    };
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, [dispatch]);

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path),
  )?.[1];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 overflow-x-hidden w-full">
      {/* Backdrop — closes sidebar on outside tap (all screen sizes) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <Sidebar />
      <Navbar title={title} />

      {/*
       * Fluid main content area.
       * - Mobile: no margin (sidebar is an overlay, not in flow)
       * - Desktop: margin-left = CSS variable so changing --sidebar-open
       *   in one place updates both Sidebar width and this offset.
       */}
      <main
        className={cn(
          'transition-[margin] duration-300 min-w-0 overflow-x-hidden',
          // Push content below fixed navbar
          'pt-[var(--navbar-height)]',
          // Mobile: full-width (sidebar is overlay)
          // Desktop: offset by sidebar width via CSS variable
          sidebarOpen
            ? 'ml-0 md:ml-[var(--sidebar-open)]'
            : 'ml-0',
        )}
      >
        {/*
         * Fluid page padding via CSS variables.
         * --content-px / --content-py use clamp() so padding scales
         * continuously with the viewport rather than jumping at breakpoints.
         */}
        <div className="p-fluid min-w-0 overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration:  5000,
          className: 'text-sm',
          style: { borderRadius: '10px', background: '#1e293b', color: '#f1f5f9' },
        }}
      />
    </div>
  );
}
