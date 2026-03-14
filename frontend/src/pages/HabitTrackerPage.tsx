import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Flame, CheckCircle2, Circle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../utils/cn';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../features/notifications/notificationsSlice';

interface Habit {
  id: string; name: string; emoji: string; color: string;
  createdAt: string; logs: string[];
}

const STORAGE_KEY = 'taskflow_habits';
const COLORS = ['bg-brand-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-pink-500','bg-purple-500','bg-rose-500','bg-teal-500'];
const EMOJIS = ['💪','📚','🏃','💧','🧘','🥗','😴','✍️','🎯','🌱','🎵','💊'];

function load(): Habit[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; } }
function save(h: Habit[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}
function last30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
}
function streak(logs: string[]): number {
  let count = 0; const d = new Date();
  while (true) { const k = d.toISOString().slice(0, 10); if (logs.includes(k)) { count++; d.setDate(d.getDate() - 1); } else break; }
  return count;
}

type Tab = 'tracker' | 'weekly' | 'monthly';

export default function HabitTrackerPage() {
  const dispatch = useAppDispatch();
  const [habits, setHabits] = useState<Habit[]>(load);
  const [adding, setAdding] = useState(false);
  const [tab,    setTab]    = useState<Tab>('tracker');
  const [name,   setName]   = useState('');
  const [emoji,  setEmoji]  = useState('💪');
  const [color,  setColor]  = useState(0);

  useEffect(() => { save(habits); }, [habits]);

  const days  = last7Days();
  const today = todayStr();

  const addHabit = () => {
    if (!name.trim()) return;
    const h: Habit = { id: crypto.randomUUID(), name: name.trim(), emoji, color: COLORS[color], createdAt: new Date().toISOString(), logs: [] };
    setHabits(prev => [...prev, h]);
    setName(''); setAdding(false);
    dispatch(addNotification({ title: 'Habit added', body: `"${h.emoji} ${h.name}" is now tracked.`, category: 'habit', link: '/habits' }));
  };

  const toggleLog = (id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const logs = h.logs.includes(date) ? h.logs.filter(d => d !== date) : [...h.logs, date];
      if (date === today && !h.logs.includes(date)) {
        dispatch(addNotification({ title: 'Habit completed! 🎉', body: `You completed "${h.emoji} ${h.name}" today.`, category: 'habit', link: '/habits' }));
      }
      return { ...h, logs };
    }));
  };

  const deleteHabit = (id: string) => setHabits(prev => prev.filter(h => h.id !== id));

  const totalToday = habits.filter(h => h.logs.includes(today)).length;
  const pct = habits.length ? Math.round((totalToday / habits.length) * 100) : 0;

  // Weekly chart data: for each day, how many habits were completed
  const weeklyData = useMemo(() => days.map(d => ({
    label:     new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    completed: habits.filter(h => h.logs.includes(d)).length,
    total:     habits.length,
    date:      d,
  })), [habits, days]);

  // Monthly data: last 30 days, completion %
  const monthlyData = useMemo(() => {
    const d30 = last30Days();
    // Group by week
    const weeks: { label: string; avg: number }[] = [];
    for (let w = 0; w < 4; w++) {
      const chunk = d30.slice(w * 7, (w + 1) * 7);
      const total = chunk.reduce((sum, d) => sum + habits.filter(h => h.logs.includes(d)).length, 0);
      const max   = chunk.length * habits.length || 1;
      weeks.push({ label: `W${w + 1}`, avg: Math.round((total / max) * 100) });
    }
    return weeks;
  }, [habits]);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'tracker', label: '7-Day Tracker' },
    { id: 'weekly',  label: 'Weekly Chart'  },
    { id: 'monthly', label: 'Monthly View'  },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Habit Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Build streaks, one day at a time.</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Add Habit
        </button>
      </div>

      {habits.length > 0 && (() => {
        const ringSize = 80;
        const r = 32; const circ = 2 * Math.PI * r;
        const ringColor = pct === 100 ? '#10b981' : pct >= 60 ? '#6366f1' : pct >= 30 ? '#f59e0b' : '#94a3b8';
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 mb-5 flex items-center gap-5">
            {/* Live ring */}
            <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
              <svg width={ringSize} height={ringSize} className="-rotate-90">
                <circle cx={ringSize/2} cy={ringSize/2} r={r} fill="none" stroke="currentColor" strokeWidth={8} className="text-slate-100 dark:text-slate-700" />
                <circle cx={ringSize/2} cy={ringSize/2} r={r} fill="none" strokeWidth={8} strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
                  stroke={ringColor} className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black" style={{ color: ringColor }}>{pct}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Today's Progress</p>
              <p className="text-xs text-slate-400 mt-0.5">{totalToday} of {habits.length} habits completed</p>
              <div className="mt-3 flex gap-3">
                <div className="text-center">
                  <p className="text-xl font-black text-emerald-600">{totalToday}</p>
                  <p className="text-[10px] text-slate-400">Done</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-slate-400">{habits.length - totalToday}</p>
                  <p className="text-[10px] text-slate-400">Left</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-amber-500">{Math.max(...habits.map(h => streak(h.logs)), 0)}🔥</p>
                  <p className="text-[10px] text-slate-400">Best streak</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tabs */}
      {habits.length > 0 && (
        <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('text-xs font-medium px-3 py-1.5 rounded-lg transition-colors', tab === t.id ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300')}
            >{t.label}</button>
          ))}
        </div>
      )}

      {/* Add habit form */}
      {adding && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-brand-200 dark:border-brand-700 p-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">New Habit</h3>
          <input autoFocus placeholder="Habit name…" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()}
            className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400 mb-3" />
          <div className="flex flex-wrap gap-1.5 mb-3">
            {EMOJIS.map(e => <button key={e} onClick={() => setEmoji(e)} className={cn('w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all', emoji === e ? 'bg-brand-100 dark:bg-brand-900/40 scale-110 ring-2 ring-brand-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700')}>{e}</button>)}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {COLORS.map((c, i) => <button key={i} onClick={() => setColor(i)} className={cn(`w-6 h-6 rounded-full ${c} transition-transform`, color === i ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : '')} />)}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            <button onClick={addHabit} className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors">Add Habit</button>
          </div>
        </div>
      )}

      {/* Weekly chart tab */}
      {tab === 'weekly' && habits.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-2"><BarChart2 size={15} /> Weekly Completion</h3>
          <p className="text-xs text-slate-400 mb-4">Habits completed per day this week</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} formatter={(v: any) => [v, 'Completed']} />
              <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, i) => (
                  <Cell key={i} fill={entry.date === today ? '#6366f1' : '#c7d2fe'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{weeklyData.reduce((s, d) => s + d.completed, 0)}</p>
              <p className="text-xs text-slate-400">Total this week</p>
            </div>
            <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-lg font-bold text-emerald-600">{Math.max(...weeklyData.map(d => d.completed))}</p>
              <p className="text-xs text-slate-400">Best day</p>
            </div>
            <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-lg font-bold text-amber-600">{Math.max(...habits.map(h => streak(h.logs)))}</p>
              <p className="text-xs text-slate-400">Best streak 🔥</p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly chart tab */}
      {tab === 'monthly' && habits.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-2"><BarChart2 size={15} /> Monthly Overview (Last 4 Weeks)</h3>
          <p className="text-xs text-slate-400 mb-4">Average completion rate per week</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} formatter={(v: any) => [`${v}%`, 'Completion']} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{Math.round(monthlyData.reduce((s, w) => s + w.avg, 0) / 4)}%</p>
            <p className="text-xs text-slate-400">Monthly average completion rate</p>
          </div>
        </div>
      )}

      {/* 7-day tracker */}
      {(tab === 'tracker' || !habits.length) && (
        <>
          {habits.length === 0 && !adding ? (
            <div className="text-center py-20 text-slate-400">
              <Flame size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No habits yet</p>
              <p className="text-sm mt-1">Add a habit to start building your streak.</p>
            </div>
          ) : habits.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="grid gap-0" style={{ gridTemplateColumns: '1fr repeat(7, 2rem) 3rem 2rem' }}>
                <div className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">Habit</div>
                {days.map(d => (
                  <div key={d} className="py-3 text-center text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                    <div className={cn('font-semibold', d === today ? 'text-brand-600 dark:text-brand-400' : '')}>{new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</div>
                    <div className={cn('text-xs', d === today ? 'text-brand-500' : 'text-slate-300 dark:text-slate-600')}>{new Date(d + 'T12:00:00').getDate()}</div>
                  </div>
                ))}
                <div className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">🔥</div>
                <div className="border-b border-slate-100 dark:border-slate-700" />
              </div>
              {habits.map((habit, idx) => {
                const s = streak(habit.logs);
                return (
                  <div key={habit.id} className={cn('grid items-center gap-0', idx !== habits.length - 1 && 'border-b border-slate-50 dark:border-slate-700/50')} style={{ gridTemplateColumns: '1fr repeat(7, 2rem) 3rem 2rem' }}>
                    <div className="px-4 py-3 flex items-center gap-2">
                      <span className="text-lg">{habit.emoji}</span>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[140px]">{habit.name}</p>
                    </div>
                    {days.map(d => {
                      const done = habit.logs.includes(d);
                      return (
                        <button key={d} onClick={() => toggleLog(habit.id, d)} className="flex items-center justify-center py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          {done ? <CheckCircle2 size={18} className={`${habit.color.replace('bg-', 'text-')} drop-shadow-sm`} /> : <Circle size={18} className={cn('text-slate-200 dark:text-slate-600', d === today && 'text-slate-300 dark:text-slate-500')} />}
                        </button>
                      );
                    })}
                    <div className="flex items-center justify-center py-3">
                      <span className={cn('text-sm font-bold', s > 0 ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600')}>{s > 0 ? `${s}🔥` : '–'}</span>
                    </div>
                    <button onClick={() => deleteHabit(habit.id)} className="flex items-center justify-center py-3 text-slate-300 hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
