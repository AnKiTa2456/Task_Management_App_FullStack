import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Trello, Users, Settings,
  LogOut, ChevronLeft, X, Clock, Calendar,
  StickyNote, BookOpen, Zap, Target, MessageSquare,
  ChevronDown, ChevronUp, User, Download, Timer, BarChart2,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout }          from '../../features/auth/authSlice';
import { toggleSidebar, setSidebarOpen } from '../../features/ui/uiSlice';

interface NavItem {
  to:    string;
  icon:  React.ElementType;
  label: string;
}

const MAIN_NAV: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/boards',    icon: Trello,          label: 'Boards'    },
  { to: '/team',      icon: Users,           label: 'Team'      },
];

const PRODUCTIVITY_NAV: NavItem[] = [
  { to: '/timeline',     icon: Clock,         label: 'Timeline'       },
  { to: '/calendar',     icon: Calendar,      label: 'Calendar'       },
  { to: '/smart-work',   icon: Zap,           label: 'Smart Work'     },
  { to: '/habits',       icon: Target,        label: 'Habit Tracker'  },
  { to: '/pomodoro',     icon: Timer,         label: 'Pomodoro'       },
  { to: '/productivity', icon: BarChart2,     label: 'Productivity'   },
];

const NOTES_NAV: NavItem[] = [
  { to: '/sticky-notes', icon: StickyNote, label: 'Sticky Notes' },
  { to: '/notebook',     icon: BookOpen,   label: 'Notebook'     },
];

const ACCOUNT_NAV: NavItem[] = [
  { to: '/contacts', icon: MessageSquare, label: 'Contacts'    },
  { to: '/export',   icon: Download,      label: 'Export Data' },
  { to: '/account',  icon: User,          label: 'Account'     },
  { to: '/settings', icon: Settings,      label: 'Settings'    },
];

function NavSection({
  label, items, sidebarOpen, defaultOpen = true, onNavClick,
}: { label: string; items: NavItem[]; sidebarOpen: boolean; defaultOpen?: boolean; onNavClick?: () => void }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      {sidebarOpen && (
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
        >
          {label}
          {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      )}
      {(open || !sidebarOpen) && (
        <div className="space-y-0.5">
          {items.map(({ to, icon: Icon, label: itemLabel }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  'sidebar-link dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand-400',
                  sidebarOpen ? '' : 'justify-center px-0',
                  isActive && 'active dark:!bg-brand-900/40 dark:!text-brand-400',
                )
              }
              title={!sidebarOpen ? itemLabel : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{itemLabel}</span>}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const dispatch        = useAppDispatch();
  const navigate        = useNavigate();
  const { user }        = useAppSelector(s => s.auth);
  const { sidebarOpen } = useAppSelector(s => s.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Close sidebar on mobile after navigation
  const handleNavClick = () => {
    if (window.innerWidth < 768) dispatch(setSidebarOpen(false));
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-full border-r flex flex-col',
        'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700',
        'transition-all duration-300 shadow-sm',
        // Mobile: slide off-screen when closed; Desktop: stay in flow (narrow)
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
      style={{
        // Width driven by CSS variable — update :root vars to resize everything at once
        width: sidebarOpen ? 'var(--sidebar-open)' : 'var(--sidebar-closed)',
      }}
    >
      {/* Logo + Toggle */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0',
        sidebarOpen ? 'justify-between' : 'justify-center',
      )}>
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Trello size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">TaskFlow</span>
          </div>
        )}
        {/* Desktop collapse, mobile close */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen
            ? <><ChevronLeft size={16} className="hidden md:block" /><X size={16} className="md:hidden" /></>
            : <ChevronLeft size={16} className="rotate-180" />
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
        <NavSection label="Main"         items={MAIN_NAV}         sidebarOpen={sidebarOpen} defaultOpen onNavClick={handleNavClick} />
        <NavSection label="Productivity" items={PRODUCTIVITY_NAV} sidebarOpen={sidebarOpen} defaultOpen onNavClick={handleNavClick} />
        <NavSection label="Notes"        items={NOTES_NAV}        sidebarOpen={sidebarOpen} defaultOpen onNavClick={handleNavClick} />
        <NavSection label="Account"      items={ACCOUNT_NAV}      sidebarOpen={sidebarOpen} defaultOpen onNavClick={handleNavClick} />
      </nav>

      {/* User profile */}
      <div className={cn(
        'px-3 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2',
        !sidebarOpen && 'justify-center',
      )}>
        <button
          onClick={() => { navigate('/account'); handleNavClick(); }}
          title="View Profile"
          className={cn(
            'flex items-center gap-2.5 flex-1 min-w-0 rounded-lg p-1 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors',
            !sidebarOpen && 'justify-center',
          )}
        >
          {user && <Avatar name={user.name} src={user.avatarUrl} size="sm" />}
          {sidebarOpen && user && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
            </div>
          )}
        </button>
        {sidebarOpen && (
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
