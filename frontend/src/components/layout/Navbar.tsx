import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTheme }  from '../../features/ui/uiSlice';
import { setFilters }   from '../../features/tasks/tasksSlice';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils/cn';

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title }: NavbarProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { theme, sidebarOpen } = useAppSelector(s => s.ui);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 h-16 bg-white border-b border-slate-100',
        'flex items-center justify-between px-4 gap-4 transition-all duration-300',
        sidebarOpen ? 'left-60' : 'left-16',
      )}
    >
      {/* Left: page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-slate-800">{title ?? 'Dashboard'}</h1>
      </div>

      {/* Center: search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            onChange={e => dispatch(setFilters({ search: e.target.value }))}
            className={cn(
              'w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200',
              'rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400',
              'focus:border-brand-400 placeholder:text-slate-400 transition-colors',
            )}
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(v => !v)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-card-hover border border-slate-100 z-50 animate-fade-in p-3">
              <p className="text-xs font-semibold text-slate-500 mb-2 px-1">Notifications</p>
              {[
                'Alex assigned you a task: "Fix login bug"',
                'Board "Sprint 12" was updated',
                'New comment on "API refactor"',
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600">{n}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User avatar */}
        {user && (
          <button className="ml-1 flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <Avatar name={user.name} src={user.avatarUrl} size="sm" />
          </button>
        )}
      </div>
    </header>
  );
}
