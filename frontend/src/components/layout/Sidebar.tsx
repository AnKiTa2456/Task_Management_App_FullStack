import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Trello, Users, Settings,
  LogOut, ChevronLeft, Plus, Layers,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout }          from '../../features/auth/authSlice';
import { toggleSidebar }   from '../../features/ui/uiSlice';

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/boards',      icon: Layers,           label: 'Boards'     },
  { to: '/board/demo',  icon: Trello,           label: 'Kanban'     },
  { to: '/team',        icon: Users,            label: 'Team'       },
  { to: '/settings',    icon: Settings,         label: 'Settings'   },
];

export default function Sidebar() {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const { user }   = useAppSelector(s => s.auth);
  const { sidebarOpen } = useAppSelector(s => s.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-full bg-white border-r border-slate-100',
        'flex flex-col transition-all duration-300 shadow-sm',
        sidebarOpen ? 'w-60' : 'w-16',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-slate-100 flex-shrink-0',
        sidebarOpen ? 'justify-between' : 'justify-center',
      )}>
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Trello size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">TaskFlow</span>
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft
            size={16}
            className={cn('transition-transform duration-300', !sidebarOpen && 'rotate-180')}
          />
        </button>
      </div>

      {/* New Task Button */}
      <div className="px-3 py-3 border-b border-slate-100">
        <button
          className={cn(
            'w-full flex items-center gap-2 bg-brand-600 text-white text-sm font-medium',
            'rounded-lg transition-colors hover:bg-brand-700',
            sidebarOpen ? 'px-3 py-2 justify-start' : 'p-2 justify-center',
          )}
        >
          <Plus size={16} />
          {sidebarOpen && 'New Task'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'sidebar-link',
                sidebarOpen ? '' : 'justify-center px-0',
                isActive && 'active',
              )
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && label}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className={cn(
        'px-3 py-3 border-t border-slate-100 flex items-center gap-3',
        !sidebarOpen && 'justify-center',
      )}>
        {user && <Avatar name={user.name} src={user.avatarUrl} size="sm" />}
        {sidebarOpen && user && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        )}
        {sidebarOpen && (
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
