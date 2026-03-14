import { useState, useMemo } from 'react';
import {
  CheckCircle2, Clock, AlertCircle, TrendingUp, Plus,
  Target, StickyNote, BookOpen, Zap, ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  PieChart, Pie, Tooltip, ResponsiveContainer, XAxis, YAxis,
} from 'recharts';
import StatsCard        from '../components/dashboard/StatsCard';
import ActivityHeatmap  from '../components/shared/ActivityHeatmap';
import RecentActivity from '../components/dashboard/RecentActivity';
import MyTasks        from '../components/dashboard/MyTasks';
import Button         from '../components/ui/Button';
import Modal          from '../components/ui/Modal';
import { Select }     from '../components/ui/Select';
import { TaskForm }   from '../features/tasks/components/TaskForm';
import { useBoards }  from '../features/boards';
import { useCreateTask } from '../features/tasks/hooks/useTasks';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { addNotification } from '../features/notifications/notificationsSlice';
import type { CreateTaskDto } from '../services/api/tasks.api';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

function useDashboardStats() {
  const { data: boards = [] } = useBoards();
  return useMemo(() => {
    const allTasks   = boards.flatMap(b => (b.columns ?? []).flatMap(c => c.tasks ?? []));
    const total      = allTasks.length;
    const done       = allTasks.filter(t => t.status === 'DONE').length;
    const inProgress = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const today      = new Date().toISOString().slice(0, 10);
    const overdue    = allTasks.filter(t => t.dueDate && t.dueDate.slice(0, 10) < today && t.status !== 'DONE').length;
    const rate       = total ? Math.round((done / total) * 100) : 0;

    const byPriority = ['LOW','MEDIUM','HIGH','URGENT'].map(p => ({
      name:  p.charAt(0) + p.slice(1).toLowerCase(),
      value: allTasks.filter(t => t.priority === p && t.status !== 'DONE').length,
      color: p === 'URGENT' ? '#ef4444' : p === 'HIGH' ? '#f59e0b' : p === 'MEDIUM' ? '#3b82f6' : '#94a3b8',
    }));

    const byStatus = boards.flatMap(b => b.columns ?? []).map(col => ({
      name:  col.name.length > 10 ? col.name.slice(0, 10) + '…' : col.name,
      tasks: (col.tasks ?? []).length,
    }));

    const completionHistory = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const completedOnDay = allTasks.filter(t => t.status === 'DONE' && t.updatedAt?.slice(0, 10) === d.toISOString().slice(0, 10)).length;
      return { label, completed: completedOnDay };
    });

    const habits   = (() => { try { return JSON.parse(localStorage.getItem('taskflow_habits') ?? '[]'); } catch { return []; } })();
    const today2   = new Date().toISOString().slice(0, 10);
    const habitDone = habits.filter((h: any) => (h.logs ?? []).includes(today2)).length;
    const notes    = (() => { try { return JSON.parse(localStorage.getItem('taskflow_sticky_notes') ?? '[]').length; } catch { return 0; } })();
    const nbPages  = (() => { try { return JSON.parse(localStorage.getItem('taskflow_notebook') ?? '[]').length; } catch { return 0; } })();

    // Heatmap dates: task completions + habit logs
    const taskDates  = allTasks.filter(t => t.status === 'DONE' && t.updatedAt).map(t => t.updatedAt!.slice(0, 10));
    const habitDates = (habits as any[]).flatMap((h: any) => h.logs ?? []);
    const heatmapDates = [...taskDates, ...habitDates];

    return { total, done, inProgress, overdue, rate, byPriority, byStatus, completionHistory, habits, habitDone, notes, nbPages, boards: boards.length, heatmapDates };
  }, [boards]);
}

function TrendChart({ data }: { data: { label: string; completed: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={70}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="completed" stroke="#6366f1" fill="url(#grad)" strokeWidth={2} dot={false} />
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} formatter={(v: any) => [v, 'Done']} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function QuickCard({ icon, label, count, link, color }: { icon: React.ReactNode; label: string; count: number; link: string; color: string }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(link)} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3 hover:shadow-md transition-shadow text-left w-full group">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-400">{count} {count === 1 ? 'item' : 'items'}</p>
      </div>
      <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
    </button>
  );
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const [taskModalOpen,    setTaskModalOpen]    = useState(false);
  const [selectedBoardId,  setSelectedBoardId]  = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState('');

  const { data: boards = [] } = useBoards();
  const { mutate: createTask, isPending } = useCreateTask(selectedBoardId);
  const stats = useDashboardStats();

  const selectedBoard = boards.find(b => b.id === selectedBoardId);
  const boardOptions  = [{ value: '', label: 'Select a board…' }, ...boards.map(b => ({ value: b.id, label: b.name }))];
  const columnOptions = [{ value: '', label: 'Select a column…' }, ...(selectedBoard?.columns ?? []).map(c => ({ value: c.id, label: c.name }))];

  const closeModal = () => { setTaskModalOpen(false); setSelectedBoardId(''); setSelectedColumnId(''); };

  const handleCreateTask = (data: CreateTaskDto) => {
    createTask(data, {
      onSuccess: (task) => {
        closeModal();
        dispatch(addNotification({ title: 'Task created', body: `"${(task as any).title}" was added to your board.`, category: 'task', link: `/board/${selectedBoardId}` }));
      },
    });
  };

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const STATS = [
    { title: 'Total Tasks',     value: stats.total,      change: `${stats.boards} board${stats.boards !== 1 ? 's' : ''}`,       positive: true,                icon: CheckCircle2, iconColor: 'text-brand-600',   iconBg: 'bg-brand-50'    },
    { title: 'In Progress',     value: stats.inProgress, change: `${stats.done} done overall`,                                   positive: true,                icon: Clock,        iconColor: 'text-blue-600',    iconBg: 'bg-blue-50'     },
    { title: 'Overdue',         value: stats.overdue,    change: stats.overdue > 0 ? 'Need attention' : 'All on track',          positive: stats.overdue === 0, icon: AlertCircle,  iconColor: 'text-red-600',     iconBg: 'bg-red-50'      },
    { title: 'Completion Rate', value: `${stats.rate}%`, change: `${stats.done} of ${stats.total} completed`,                   positive: stats.rate >= 70,    icon: TrendingUp,   iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50'  },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your productivity overview for today.</p>
        </div>
        <Button icon={<Plus size={16} />} size="md" onClick={() => setTaskModalOpen(true)}>New Task</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(s => <StatsCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Task Completion — Last 7 Days</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tasks marked done per day</p>
            </div>
            <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.done}</span>
          </div>
          <TrendChart data={stats.completionHistory} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Priority Breakdown</h3>
          <p className="text-xs text-slate-400 mb-3">Open tasks by priority</p>
          {stats.byPriority.every(p => p.value === 0) ? (
            <div className="flex items-center justify-center h-[120px] text-slate-300 dark:text-slate-600 text-sm">No open tasks</div>
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={stats.byPriority} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value">
                  {stats.byPriority.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any, name: any) => [v, name]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {stats.byPriority.map(p => (
              <div key={p.name} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ background: p.color }} /> {p.name}: {p.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {stats.byStatus.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Tasks Per Column (All Boards)</h3>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={stats.byStatus} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis  tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
              <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Target size={15} className="text-emerald-500" /> Today's Habits
          </h3>
          {stats.habits.length === 0 ? (
            <p className="text-xs text-slate-400">No habits yet.</p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(stats.habitDone / stats.habits.length) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats.habitDone}/{stats.habits.length}</span>
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {stats.habits.slice(0, 5).map((h: any) => {
                  const doneToday = (h.logs ?? []).includes(new Date().toISOString().slice(0, 10));
                  return (
                    <div key={h.id} className={cn('flex items-center gap-2 text-xs', doneToday ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300')}>
                      <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]', doneToday ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600')}>
                        {doneToday ? '✓' : ''}
                      </span>
                      {h.emoji} {h.name}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          <QuickCard icon={<StickyNote size={18} className="text-yellow-600" />} label="Sticky Notes" count={stats.notes}          link="/sticky-notes" color="bg-yellow-50 dark:bg-yellow-900/20" />
          <QuickCard icon={<BookOpen  size={18} className="text-purple-600" />} label="Notebook"     count={stats.nbPages}         link="/notebook"     color="bg-purple-50 dark:bg-purple-900/20" />
          <QuickCard icon={<Zap       size={18} className="text-amber-600"  />} label="Smart Work"   count={0}                     link="/smart-work"   color="bg-amber-50  dark:bg-amber-900/20"  />
          <QuickCard icon={<Target    size={18} className="text-emerald-600"/>} label="Habits"       count={stats.habits.length}   link="/habits"       color="bg-emerald-50 dark:bg-emerald-900/20" />
        </div>
      </div>

      <ActivityHeatmap dates={stats.heatmapDates} title="Activity Heatmap" color="brand" weeks={17} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MyTasks />
        <RecentActivity />
      </div>

      <Modal open={taskModalOpen} onClose={closeModal} title="Add new task">
        <div className="space-y-4">
          {boards.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No boards yet. Create a board first from the Boards page.</p>
          ) : (
            <>
              <Select label="Board" options={boardOptions} value={selectedBoardId} onChange={e => { setSelectedBoardId(e.target.value); setSelectedColumnId(''); }} />
              {selectedBoardId && <Select label="Column" options={columnOptions} value={selectedColumnId} onChange={e => setSelectedColumnId(e.target.value)} />}
              {selectedColumnId && <TaskForm columnId={selectedColumnId} onSubmit={handleCreateTask} onCancel={closeModal} isLoading={isPending} />}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
