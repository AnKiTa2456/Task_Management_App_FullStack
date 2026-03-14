import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Search, Sun, Moon, X, CheckCheck, Trash2,
  CheckCircle2, MessageSquare, Target, AlertTriangle, Info,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTheme } from '../../features/ui/uiSlice';
import { markRead, markAllRead, deleteNotification, clearAll } from '../../features/notifications/notificationsSlice';
import type { NotifCategory } from '../../features/notifications/notificationsSlice';
import Avatar from '../ui/Avatar';
import GlobalSearch from '../shared/GlobalSearch';
import { cn } from '../../utils/cn';
import { formatRelative } from '../../utils/formatDate';

function NotifIcon({ category }: { category: NotifCategory }) {
  const cls = 'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0';
  switch (category) {
    case 'task':     return <div className={`${cls} bg-blue-50 dark:bg-blue-900/30`}><CheckCircle2 size={14} className="text-blue-500" /></div>;
    case 'comment':  return <div className={`${cls} bg-purple-50 dark:bg-purple-900/30`}><MessageSquare size={14} className="text-purple-500" /></div>;
    case 'habit':    return <div className={`${cls} bg-emerald-50 dark:bg-emerald-900/30`}><Target size={14} className="text-emerald-500" /></div>;
    case 'deadline': return <div className={`${cls} bg-red-50 dark:bg-red-900/30`}><AlertTriangle size={14} className="text-red-500" /></div>;
    default:         return <div className={`${cls} bg-slate-50 dark:bg-slate-700`}><Info size={14} className="text-slate-500" /></div>;
  }
}

interface NavbarProps { title?: string; }

export default function Navbar({ title }: NavbarProps) {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const { user }   = useAppSelector(s => s.auth);
  const { theme, sidebarOpen } = useAppSelector(s => s.ui);
  const notifications = useAppSelector(s => s.notifications.items);

  const [showNotif,  setShowNotif]  = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notif dropdown on outside click
  useEffect(() => {
    if (!showNotif) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotif]);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 z-20 h-16 border-b transition-all duration-300',
          'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700',
          'flex items-center justify-between px-4 gap-4',
          sidebarOpen ? 'left-60' : 'left-16',
        )}
      >
        {/* Left: page title */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">{title ?? 'Dashboard'}</h1>
        </div>

        {/* Center: search trigger */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <button
            onClick={() => setShowSearch(true)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors',
              'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600',
              'text-slate-400 hover:border-brand-300 hover:bg-white dark:hover:bg-slate-600',
            )}
          >
            <Search size={15} className="flex-shrink-0" />
            <span className="flex-1 text-left">Search everything…</span>
            <kbd className="hidden sm:block text-xs bg-slate-100 dark:bg-slate-600 px-1.5 py-0.5 rounded text-slate-400">⌘K</kbd>
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          {/* Mobile search */}
          <button
            onClick={() => setShowSearch(true)}
            className="sm:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Search size={17} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(v => !v)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 animate-fade-in overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Notifications {unreadCount > 0 && <span className="ml-1 text-xs text-brand-600 dark:text-brand-400">({unreadCount} new)</span>}
                  </span>
                  <div className="flex gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => dispatch(markAllRead())}
                        title="Mark all as read"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={() => dispatch(clearAll())}
                        title="Clear all"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-slate-400">
                      <Bell size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { dispatch(markRead(n.id)); if (n.link) { navigate(n.link); setShowNotif(false); } }}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0',
                          n.read ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50' : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                        )}
                      >
                        <NotifIcon category={n.category} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs font-semibold truncate', n.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-800 dark:text-slate-100')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">{formatRelative(n.createdAt)}</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); dispatch(deleteNotification(n.id)); }}
                          className="p-1 rounded text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 text-center">
                  <button
                    onClick={() => { navigate('/settings'); setShowNotif(false); }}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Manage notification preferences →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User avatar → account */}
          {user && (
            <button
              onClick={() => navigate('/account')}
              className="ml-1 flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Account"
            >
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            </button>
          )}
        </div>
      </header>

      {/* Global search overlay */}
      <GlobalSearch open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
