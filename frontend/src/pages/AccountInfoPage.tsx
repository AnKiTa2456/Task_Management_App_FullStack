import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, Shield, Key, LogOut,
  Edit3, ChevronRight, CheckCircle2,
} from 'lucide-react';
import { useAppSelector } from '../app/hooks';
import Avatar from '../components/ui/Avatar';
import { useBoards } from '../features/boards';

export default function AccountInfoPage() {
  const navigate    = useNavigate();
  const { user }    = useAppSelector(s => s.auth);
  const { data: boards = [] } = useBoards();

  const totalTasks = boards.flatMap(b => (b.columns ?? []).flatMap(c => c.tasks ?? [])).length;
  const doneTasks  = boards.flatMap(b => (b.columns ?? []).flatMap(c => (c.tasks ?? []).filter(t => t.status === 'DONE'))).length;

  if (!user) return null;

  const joinedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Account Information</h1>

      {/* Profile card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={user.name} src={user.avatarUrl} size="lg" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
              <CheckCircle2 size={10} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline"
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Account details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Account Details</h3>
        </div>
        {[
          { icon: User,     label: 'Full Name',     value: user.name  },
          { icon: Mail,     label: 'Email Address', value: user.email },
          { icon: Calendar, label: 'Member Since',  value: joinedDate },
          { icon: Shield,   label: 'Account Type',  value: 'Standard Account' },
          { icon: Key,      label: 'User ID',        value: user.id.slice(0, 16) + '...' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center mr-4 flex-shrink-0">
              <Icon size={15} className="text-slate-500 dark:text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your Activity</h3>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700">
          {[
            { label: 'Boards',     value: boards.length },
            { label: 'Total Tasks', value: totalTasks   },
            { label: 'Completed',  value: doneTasks     },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-5 text-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quick Actions</h3>
        </div>
        {[
          { label: 'Edit Profile & Avatar',    path: '/settings',  icon: Edit3  },
          { label: 'Change Password',          path: '/forgot-password', icon: Key },
          { label: 'Notification Preferences', path: '/settings',  icon: Shield },
        ].map(({ label, path, icon: Icon }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="w-full flex items-center px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <Icon size={16} className="text-slate-400 mr-3" />
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 text-left">{label}</span>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
          </button>
        ))}
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center px-5 py-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={16} className="text-red-400 mr-3" />
          <span className="flex-1 text-sm text-red-500 dark:text-red-400 text-left">Sign Out</span>
          <ChevronRight size={14} className="text-red-300" />
        </button>
      </div>
    </div>
  );
}
