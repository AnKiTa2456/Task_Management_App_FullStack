import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Settings, X, Coffee, Zap } from 'lucide-react';
import { useBoards } from '../features/boards';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../features/notifications/notificationsSlice';
import { cn } from '../utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase    = 'work' | 'short-break' | 'long-break';
type Session  = { type: Phase; taskId?: string; completedAt: string; duration: number; };

const PHASE_CONFIG: Record<Phase, { label: string; color: string; ring: string; bg: string }> = {
  'work':        { label: 'Focus',       color: 'text-brand-600 dark:text-brand-400',   ring: 'stroke-brand-500',   bg: 'bg-brand-50  dark:bg-brand-900/20'  },
  'short-break': { label: 'Short Break', color: 'text-emerald-600 dark:text-emerald-400', ring: 'stroke-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  'long-break':  { label: 'Long Break',  color: 'text-blue-600 dark:text-blue-400',       ring: 'stroke-blue-500',    bg: 'bg-blue-50  dark:bg-blue-900/20'    },
};

interface Config { work: number; short: number; long: number; longAfter: number; }
const DEFAULT_CONFIG: Config = { work: 25, short: 5, long: 15, longAfter: 4 };

const STORAGE_KEY_SESSIONS = 'taskflow_pomodoro_sessions';
const STORAGE_KEY_CONFIG   = 'taskflow_pomodoro_config';

function loadSessions(): Session[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) ?? '[]'); } catch { return []; } }
function loadConfig(): Config      { try { return { ...DEFAULT_CONFIG, ...JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIG) ?? '{}') }; } catch { return DEFAULT_CONFIG; } }
function saveSessions(s: Session[]) { localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(s.slice(0, 100))); }
function saveConfig(c: Config)      { localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(c)); }

function pad(n: number) { return String(n).padStart(2, '0'); }

// ─── Ring SVG ────────────────────────────────────────────────────────────────

function TimerRing({ pct, phase, size = 220 }: { pct: number; phase: Phase; size?: number }) {
  const r   = (size / 2) - 12;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct);
  const cfg  = PHASE_CONFIG[phase];

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={10} className="text-slate-100 dark:text-slate-700" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        strokeWidth={10} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        className={cn('transition-all duration-1000', cfg.ring)}
      />
    </svg>
  );
}

// ─── PomodoroPage ─────────────────────────────────────────────────────────────

export default function PomodoroPage() {
  const dispatch = useAppDispatch();
  const { data: boards = [] } = useBoards();

  const [config,      setConfig]      = useState<Config>(loadConfig);
  const [sessions,    setSessions]    = useState<Session[]>(loadSessions);
  const [phase,       setPhase]       = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(config.work * 60);
  const [running,     setRunning]     = useState(false);
  const [cycleCount,  setCycleCount]  = useState(0);
  const [selectedTask, setSelectedTask] = useState('');
  const [showConfig,  setShowConfig]  = useState(false);
  const [localConfig, setLocalConfig] = useState<Config>(config);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSecs   = (phase === 'work' ? config.work : phase === 'short-break' ? config.short : config.long) * 60;
  const pct         = 1 - secondsLeft / totalSecs;
  const cfg         = PHASE_CONFIG[phase];

  const allTasks = boards.flatMap(b => (b.columns ?? []).flatMap(c => c.tasks ?? []));
  const todaySessions    = sessions.filter(s => s.completedAt.slice(0, 10) === new Date().toISOString().slice(0, 10));
  const todayWorkMinutes = todaySessions.filter(s => s.type === 'work').reduce((sum, s) => sum + s.duration, 0);

  const completePhase = useCallback(() => {
    setRunning(false);
    const newSession: Session = {
      type:        phase,
      taskId:      selectedTask || undefined,
      completedAt: new Date().toISOString(),
      duration:    (phase === 'work' ? config.work : phase === 'short-break' ? config.short : config.long),
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    saveSessions(updated);

    if (phase === 'work') {
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);
      dispatch(addNotification({ title: '🍅 Pomodoro complete!', body: `Great focus session! Take a ${newCycle % config.longAfter === 0 ? 'long' : 'short'} break.`, category: 'system', link: '/pomodoro' }));
      const nextPhase: Phase = newCycle % config.longAfter === 0 ? 'long-break' : 'short-break';
      setPhase(nextPhase);
      setSecondsLeft((nextPhase === 'long-break' ? config.long : config.short) * 60);
    } else {
      dispatch(addNotification({ title: '⏰ Break over!', body: 'Ready for another focus session?', category: 'system', link: '/pomodoro' }));
      setPhase('work');
      setSecondsLeft(config.work * 60);
    }
  }, [phase, config, cycleCount, sessions, selectedTask, dispatch]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { clearInterval(intervalRef.current!); completePhase(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, completePhase]);

  const reset  = () => { setRunning(false); setSecondsLeft(totalSecs); };
  const skip   = () => { setRunning(false); completePhase(); };
  const toggle = () => setRunning(r => !r);

  const applyConfig = () => {
    setConfig(localConfig);
    saveConfig(localConfig);
    setSecondsLeft(localConfig.work * 60);
    setPhase('work');
    setRunning(false);
    setShowConfig(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            🍅 Pomodoro Focus
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay focused with time-boxed sessions.
          </p>
        </div>
        <button onClick={() => setShowConfig(true)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 transition-colors">
          <Settings size={18} />
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{todaySessions.filter(s => s.type === 'work').length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Sessions today</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{todayWorkMinutes}</p>
          <p className="text-xs text-slate-400 mt-0.5">Minutes focused</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3 text-center">
          <p className="text-2xl font-bold text-amber-500">{cycleCount % config.longAfter}/{config.longAfter}</p>
          <p className="text-xs text-slate-400 mt-0.5">Until long break</p>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1">
        {(['work', 'short-break', 'long-break'] as Phase[]).map(p => (
          <button key={p} onClick={() => { if (!running) { setPhase(p); setSecondsLeft((p === 'work' ? config.work : p === 'short-break' ? config.short : config.long) * 60); } }}
            className={cn('flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors', phase === p ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}>
            {PHASE_CONFIG[p].label}
          </button>
        ))}
      </div>

      {/* Main timer */}
      <div className={cn('rounded-3xl p-8 flex flex-col items-center gap-6 transition-colors', cfg.bg)}>
        {/* Ring */}
        <div className="relative">
          <TimerRing pct={pct} phase={phase} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-5xl font-bold tabular-nums', cfg.color)}>
              {pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}
            </span>
            <span className={cn('text-sm font-medium mt-1', cfg.color)}>{cfg.label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={reset} className="p-3 rounded-xl bg-white/60 dark:bg-slate-700/60 text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-colors">
            <RotateCcw size={18} />
          </button>
          <button onClick={toggle}
            className={cn('flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-sm shadow-lg transition-all',
              phase === 'work' ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-200 dark:shadow-none' :
              phase === 'short-break' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600')}>
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={skip} className="p-3 rounded-xl bg-white/60 dark:bg-slate-700/60 text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-colors">
            <SkipForward size={18} />
          </button>
        </div>
      </div>

      {/* Task selector */}
      <div className="mt-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Working on…</p>
        <select
          value={selectedTask}
          onChange={e => setSelectedTask(e.target.value)}
          className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400"
        >
          <option value="">— No specific task —</option>
          {allTasks.filter(t => t.status !== 'DONE').map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {/* Session history */}
      {sessions.length > 0 && (
        <div className="mt-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Recent Sessions</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sessions.slice(0, 15).map((s, i) => {
              const task = allTasks.find(t => t.id === s.taskId);
              return (
                <div key={i} className="flex items-center gap-3">
                  {s.type === 'work' ? <Zap size={14} className="text-brand-500 flex-shrink-0" /> : <Coffee size={14} className="text-emerald-500 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{PHASE_CONFIG[s.type].label} · {s.duration}min</p>
                    {task && <p className="text-xs text-slate-400 truncate">{task.title}</p>}
                  </div>
                  <span className="text-xs text-slate-300 dark:text-slate-600 flex-shrink-0">
                    {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Config modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfig(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 w-80 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Timer Settings</h3>
              <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'work' as keyof Config, label: 'Focus Duration', unit: 'min' },
                { key: 'short' as keyof Config, label: 'Short Break', unit: 'min' },
                { key: 'long' as keyof Config, label: 'Long Break', unit: 'min' },
                { key: 'longAfter' as keyof Config, label: 'Long Break After', unit: 'sessions' },
              ].map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">{label}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={60} value={localConfig[key]}
                      onChange={e => setLocalConfig(c => ({ ...c, [key]: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="flex-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400" />
                    <span className="text-xs text-slate-400">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={applyConfig} className="w-full mt-5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
              Apply Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
