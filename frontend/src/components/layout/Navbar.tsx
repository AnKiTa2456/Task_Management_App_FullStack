import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Search, Sun, Moon, X, CheckCheck, Trash2,
  CheckCircle2, MessageSquare, Target, AlertTriangle, Info,
  User, Settings, LogOut, Menu,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTheme, toggleSidebar } from '../../features/ui/uiSlice';
import { logout } from '../../features/auth/authSlice';
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
    case 'comment':  return <div className={`${cls} bg-violet-50 dark:bg-violet-900/30`}><MessageSquare size={14} className="text-violet-500" /></div>;
    case 'habit':    return <div className={`${cls} bg-emerald-50 dark:bg-emerald-900/30`}><Target size={14} className="text-emerald-500" /></div>;
    case 'deadline': return <div className={`${cls} bg-rose-50 dark:bg-rose-900/30`}><AlertTriangle size={14} className="text-rose-500" /></div>;
    default:         return <div className={`${cls} bg-slate-50 dark:bg-slate-700`}><Info size={14} className="text-slate-400" /></div>;
  }
}

/* ── Animated pill theme toggle ─────────────────────────────────────────── */
function ThemeToggle() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector(s => s.ui);
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative flex items-center w-14 h-7 rounded-full p-0.5 transition-all duration-500 flex-shrink-0',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
        isDark
          ? 'bg-slate-700 shadow-inner shadow-slate-900/50'
          : 'bg-amber-100 shadow-inner shadow-amber-200/80',
      )}
      aria-label="Toggle theme"
    >
      {/* Track icons */}
      <Sun
        size={11}
        className={cn(
          'absolute left-1.5 transition-all duration-300',
          isDark ? 'opacity-30 text-slate-500' : 'opacity-100 text-amber-500',
        )}
      />
      <Moon
        size={11}
        className={cn(
          'absolute right-1.5 transition-all duration-300',
          isDark ? 'opacity-100 text-indigo-300' : 'opacity-30 text-slate-400',
        )}
      />
      {/* Sliding thumb */}
      <span
        className={cn(
          'relative z-10 w-6 h-6 rounded-full shadow-md flex items-center justify-center',
          'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          isDark
            ? 'translate-x-7 bg-slate-900 text-indigo-300'
            : 'translate-x-0 bg-white text-amber-500',
        )}
      >
        {isDark
          ? <Moon size={12} className="animate-spin-once" />
          : <Sun  size={12} className="animate-spin-once" />
        }
      </span>
    </button>
  );
}

interface NavbarProps { title?: string; }

export default function Navbar({ title }: NavbarProps) {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const { user }   = useAppSelector(s => s.auth);
  const { sidebarOpen } = useAppSelector(s => s.ui);
  const notifications   = useAppSelector(s => s.notifications.items);

  const [showNotif,    setShowNotif]    = useState(false);
  const [showSearch,   setShowSearch]   = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef    = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!showNotif) return;
    const h = (e: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showNotif]);

  useEffect(() => {
    if (!showUserMenu) return;
    const h = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showUserMenu]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 z-20 h-16 border-b',
          'flex items-center justify-between px-4 gap-3',
          /* Glassmorphism: semi-transparent + blur */
          'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md',
          'border-slate-200/60 dark:border-slate-700/60',
          'shadow-sm shadow-slate-200/40 dark:shadow-slate-900/40',
          'transition-[left,background-color,border-color] duration-300',
          sidebarOpen ? 'left-0 md:left-[var(--sidebar-open)]' : 'left-0',
        )}
      >
        {/* ── Left ── */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="navbar-icon-btn"
            title="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {title ?? 'Dashboard'}
          </h1>
        </div>

        {/* ── Center search ── */}
        <div className="flex-1 max-w-xs hidden sm:block">
          <button
            onClick={() => setShowSearch(true)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm',
              'bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700',
              'text-slate-400 dark:text-slate-500',
              'hover:bg-white dark:hover:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-600',
              'hover:text-slate-600 dark:hover:text-slate-300',
              'transition-all duration-200 group',
            )}
          >
            <Search size={14} className="flex-shrink-0 group-hover:text-brand-500 transition-colors duration-200" />
            <span className="flex-1 text-left text-xs">Search everything…</span>
            <kbd className="text-[10px] bg-slate-200/80 dark:bg-slate-700 px-1.5 py-0.5 rounded-md text-slate-400 font-mono">⌘K</kbd>
          </button>
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1">

          {/* Mobile search */}
          <button onClick={() => setShowSearch(true)} className="sm:hidden navbar-icon-btn">
            <Search size={16} />
          </button>

          {/* ── Animated pill theme toggle ── */}
          <ThemeToggle />

          {/* ── Notifications ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(v => !v)}
              className={cn('navbar-icon-btn relative', showNotif && 'bg-slate-100 dark:bg-slate-800')}
            >
              <Bell size={16} className={cn('transition-transform duration-200', showNotif && 'rotate-12')} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-rose-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5 animate-pulse-once">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="dropdown-panel right-0 top-12 w-80">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/80">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-1.5 text-xs bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </span>
                  <div className="flex gap-1">
                    {unreadCount > 0 && (
                      <button onClick={() => dispatch(markAllRead())} title="Mark all read"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors duration-150">
                        <CheckCheck size={13} />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={() => dispatch(clearAll())} title="Clear all"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors duration-150">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Bell size={28} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-medium">All caught up!</p>
                      <p className="text-xs mt-0.5 opacity-70">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { dispatch(markRead(n.id)); if (n.link) { navigate(n.link); setShowNotif(false); } }}
                        className={cn(
                          'group flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-slate-50 dark:border-slate-700/40 last:border-0',
                          'transition-colors duration-150',
                          n.read
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            : 'bg-brand-50/40 dark:bg-brand-900/10 hover:bg-brand-50 dark:hover:bg-brand-900/20',
                        )}
                      >
                        <NotifIcon category={n.category} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs font-semibold truncate', n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">{formatRelative(n.createdAt)}</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); dispatch(deleteNotification(n.id)); }}
                          className="p-1 rounded text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-150 flex-shrink-0"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700/80 text-center">
                  <button
                    onClick={() => { navigate('/settings'); setShowNotif(false); }}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors duration-150"
                  >
                    Manage preferences →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── User avatar dropdown ── */}
          {user && (
            <div className="relative ml-0.5" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(v => !v)}
                className={cn(
                  'flex items-center gap-2 px-1.5 py-1 rounded-xl transition-all duration-200',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  showUserMenu && 'bg-slate-100 dark:bg-slate-800',
                )}
                title="Account"
              >
                <div className={cn('transition-transform duration-200', showUserMenu && 'scale-95')}>
                  <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                </div>
              </button>

              {showUserMenu && (
                <div className="dropdown-panel right-0 top-12 w-56">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/80">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <button onClick={() => { navigate('/account'); setShowUserMenu(false); }} className="dropdown-item">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <User size={13} className="text-blue-500" />
                      </div>
                      View Profile
                    </button>
                    <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className="dropdown-item">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Settings size={13} className="text-slate-500" />
                      </div>
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700/80 py-1.5">
                    <button
                      onClick={() => { dispatch(logout()); navigate('/login'); setShowUserMenu(false); }}
                      className="dropdown-item text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                        <LogOut size={13} className="text-rose-500" />
                      </div>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <GlobalSearch open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
