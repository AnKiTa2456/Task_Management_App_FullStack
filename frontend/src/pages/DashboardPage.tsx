import {
  CheckCircle2, Clock, AlertCircle, TrendingUp, Plus,
} from 'lucide-react';
import StatsCard      from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import MyTasks        from '../components/dashboard/MyTasks';
import Button         from '../components/ui/Button';
import { useAppSelector } from '../app/hooks';

const STATS = [
  {
    title: 'Total Tasks',   value: 48,  change: '12% this week', positive: true,
    icon: CheckCircle2, iconColor: 'text-brand-600', iconBg: 'bg-brand-50',
  },
  {
    title: 'In Progress',   value: 12,  change: '3 added today', positive: true,
    icon: Clock,        iconColor: 'text-blue-600',  iconBg: 'bg-blue-50',
  },
  {
    title: 'Overdue',       value: 5,   change: '2 from yesterday', positive: false,
    icon: AlertCircle,  iconColor: 'text-red-600',   iconBg: 'bg-red-50',
  },
  {
    title: 'Completion Rate', value: '78%', change: '5% from last week', positive: true,
    icon: TrendingUp,   iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50',
  },
];

export default function DashboardPage() {
  const { user } = useAppSelector(s => s.auth);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Button icon={<Plus size={16} />} size="md">
          New Task
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(s => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      {/* Progress bar section */}
      <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Sprint Progress — Sprint 12</h3>
          <span className="text-xs text-slate-400">8 days left</span>
        </div>

        <div className="space-y-3">
          {[
            { label: 'To Do',       count: 14, total: 48, color: 'bg-slate-400' },
            { label: 'In Progress', count: 12, total: 48, color: 'bg-blue-500'  },
            { label: 'In Review',   count: 9,  total: 48, color: 'bg-amber-500' },
            { label: 'Done',        count: 13, total: 48, color: 'bg-emerald-500' },
          ].map(({ label, count, total, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600 font-medium">{label}</span>
                <span className="text-xs text-slate-400">{count}/{total}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${color}`}
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MyTasks />
        <RecentActivity />
      </div>
    </div>
  );
}
