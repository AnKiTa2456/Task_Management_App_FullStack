import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';
import { useAppSelector } from '../../app/hooks';
import { cn } from '../../utils/cn';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/boards':    'My Boards',
  '/board':     'Kanban Board',
  '/team':      'Team',
  '/settings':  'Settings',
};

export default function AppLayout() {
  const { sidebarOpen, theme } = useAppSelector(s => s.ui);
  const location               = useLocation();

  // Sync Redux theme → <html class="dark">
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path),
  )?.[1];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Sidebar />
      <Navbar title={title} />

      <main
        className={cn(
          'transition-all duration-300 pt-16',
          sidebarOpen ? 'ml-60' : 'ml-16',
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm',
          style: { borderRadius: '10px', background: '#1e293b', color: '#f1f5f9' },
        }}
      />
    </div>
  );
}
