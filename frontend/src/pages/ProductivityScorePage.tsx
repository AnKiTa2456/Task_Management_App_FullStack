import { useMemo, useState, useCallback } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, Tooltip,
  BarChart, Bar, Cell,
} from 'recharts';
import { TrendingUp, Target, Zap, BookOpen, Timer, Award, RefreshCw } from 'lucide-react';
import { useBoards } from '../features/boards';
import ActivityHeatmap from '../components/shared/ActivityHeatmap';
import { cn } from '../utils/cn';

// ─── Score Engine ─────────────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100) { return Math.min(max, Math.max(min, v)); }

function useProductivityScore(refreshKey: number) {
  const { data: boards = [] } = useBoards();

  return useMemo(() => {
    const allTasks   = boards.flatMap(b => (b.columns ?? []).flatMap(c => c.tasks ?? []));
    const today      = new Date().toISOString().slice(0, 10);

    // ── Task Score (0–100): completion rate × weight + overdue penalty
    const total      = allTasks.length;
    const done       = allTasks.filter(t => t.status === 'DONE').length;
    const overdue    = allTasks.filter(t => t.dueDate && t.dueDate.slice(0, 10) < today && t.status !== 'DONE').length;
    const taskScore  = clamp(total ? Math.round((done / total) * 100) - overdue * 5 : 0);

    // ── Habit Score (0–100): avg 7-day completion rate
    const habits: any[] = (() => { try { return JSON.parse(localStorage.getItem('taskflow_habits') ?? '[]'); } catch { return []; } })();
    let habitScore = 0;
    if (habits.length > 0) {
      const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().slice(0, 10); });
      const doneCount = habits.reduce((acc: number, h: any) => acc + last7.filter(d => (h.logs ?? []).includes(d)).length, 0);
      habitScore = clamp(Math.round((doneCount / (habits.length * 7)) * 100));
    }

    // ── Focus Score (0–100): pomodoro work sessions in last 7 days (max 14 = 100)
    const pomSessions: any[] = (() => { try { return JSON.parse(localStorage.getItem('taskflow_pomodoro_sessions') ?? '[]'); } catch { return []; } })();
    const last7Dates = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().slice(0, 10); });
    const recentWork = pomSessions.filter(s => s.type === 'work' && last7Dates.includes(s.completedAt.slice(0, 10))).length;
    const focusScore = clamp(Math.round((recentWork / 14) * 100));

    // ── Notes Score (0–100): notebook pages + sticky notes (max 20 = 100)
    const nbPages    = (() => { try { return JSON.parse(localStorage.getItem('taskflow_notebook') ?? '[]').length; } catch { return 0; } })();
    const stickyNotes = (() => { try { return JSON.parse(localStorage.getItem('taskflow_sticky_notes') ?? '[]').length; } catch { return 0; } })();
    const notesScore = clamp(Math.round(((nbPages + stickyNotes) / 20) * 100));

    // ── Smart Work Score (0–100): completion rate of smart work items
    const smartWork: any[] = (() => { try { return JSON.parse(localStorage.getItem('taskflow_smart_work') ?? '[]'); } catch { return []; } })();
    const swDone = smartWork.filter((i: any) => i.status === 'done').length;
    const smartScore = clamp(smartWork.length ? Math.round((swDone / smartWork.length) * 100) : 0);

    // ── Overall Score: weighted average
    const overall = clamp(Math.round(taskScore * 0.35 + habitScore * 0.25 + focusScore * 0.20 + notesScore * 0.10 + smartScore * 0.10));

    // ── Radar data
    const radar = [
      { axis: 'Tasks',    score: taskScore  },
      { axis: 'Habits',   score: habitScore },
      { axis: 'Focus',    score: focusScore },
      { axis: 'Notes',    score: notesScore },
      { axis: 'Planning', score: smartScore },
    ];

    // ── 7-day trend (overall per day approximation using task + habit logs)
    const trend = last7Dates.reverse().map(d => {
      const tasksOnDay  = allTasks.filter(t => t.status === 'DONE' && t.updatedAt?.slice(0, 10) === d).length;
      const habitsOnDay = habits.filter((h: any) => (h.logs ?? []).includes(d)).length;
      const pomOnDay    = pomSessions.filter(s => s.type === 'work' && s.completedAt.slice(0, 10) === d).length;
      const dayScore    = clamp(Math.round((tasksOnDay * 10 + habitsOnDay * 8 + pomOnDay * 5)));
      return { label: new Date(d).toLocaleDateString('en-US', { weekday: 'short' }), score: dayScore };
    });

    // ── Heatmap dates
    const heatmapDates = [
      ...allTasks.filter(t => t.status === 'DONE' && t.updatedAt).map(t => t.updatedAt!.slice(0, 10)),
      ...habits.flatMap((h: any) => h.logs ?? []),
      ...pomSessions.filter(s => s.type === 'work').map((s: any) => s.completedAt.slice(0, 10)),
    ];

    return { overall, taskScore, habitScore, focusScore, notesScore, smartScore, radar, trend, heatmapDates, recentWork, overdue };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boards, refreshKey]);
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const size = 180;
  const r    = 75;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - score / 100);
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={12} className="text-slate-100 dark:text-slate-700" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          strokeWidth={12} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={dash}
          stroke={color}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs font-semibold text-slate-400 mt-0.5">{label}</span>
      </div>
    </div>
  );
}

// ─── Dimension Card ──────────────────────────────────────────────────────────

function DimCard({ icon, label, score, desc }: { icon: React.ReactNode; label: string; score: number; desc: string }) {
  const color = score >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
              : score >= 60 ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
              : score >= 40 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
              :                'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
  const bar   = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-brand-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', color)}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
          <p className="text-xs text-slate-400 truncate">{desc}</p>
        </div>
        <span className={cn('text-lg font-black', color.split(' ')[2])}>{score}</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', bar)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductivityScorePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  const s = useProductivityScore(refreshKey);

  const DIMS = [
    { icon: <Target  size={16} />, label: 'Task Completion',  score: s.taskScore,   desc: 'Board tasks done vs total' },
    { icon: <Award   size={16} />, label: 'Habit Consistency',score: s.habitScore,  desc: '7-day habit completion rate' },
    { icon: <Timer   size={16} />, label: 'Focus Sessions',   score: s.focusScore,  desc: `${s.recentWork} pomodoros this week` },
    { icon: <BookOpen size={16} />,label: 'Note-taking',      score: s.notesScore,  desc: 'Notebook pages + sticky notes' },
    { icon: <Zap     size={16} />, label: 'Smart Planning',   score: s.smartScore,  desc: 'Smart work items completed' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-600" /> Productivity Score
          </h1>
          <button onClick={refresh} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          A holistic view of your productivity across all dimensions.
        </p>
      </div>

      {/* Overall + Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col items-center gap-4">
          <ScoreRing score={s.overall} />
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Overall Score</p>
            <p className="text-xs text-slate-400 mt-0.5">Based on tasks, habits, focus, notes &amp; planning</p>
          </div>
          {s.overdue > 0 && (
            <div className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl px-3 py-2 text-center">
              ⚠️ {s.overdue} overdue task{s.overdue !== 1 ? 's' : ''} dragging your score down
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Dimension Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={s.radar} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dimension cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DIMS.map(d => <DimCard key={d.label} {...d} />)}
      </div>

      {/* 7-day trend */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">7-Day Activity Trend</h3>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={s.trend} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#scoreGrad)" strokeWidth={2} dot={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} formatter={(v: any) => [v, 'Activity']} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Score by Dimension</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={s.radar} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="axis" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} formatter={(v: any) => [v, 'Score']} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {s.radar.map((entry, i) => (
                <Cell key={i} fill={entry.score >= 80 ? '#10b981' : entry.score >= 60 ? '#6366f1' : entry.score >= 40 ? '#f59e0b' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activity heatmap */}
      <ActivityHeatmap dates={s.heatmapDates} title="All Activity Heatmap" color="brand" weeks={17} />
    </div>
  );
}
