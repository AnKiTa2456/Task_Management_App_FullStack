import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar } from 'lucide-react';
import { useBoards } from '../features/boards';
import { cn } from '../utils/cn';

interface CalTask { id: string; title: string; priority: string; boardName: string; }
interface CalEvent { id: string; title: string; date: string; color: string; time?: string; }

const PRIORITY_DOT: Record<string, string> = { LOW: 'bg-slate-400', MEDIUM: 'bg-blue-500', HIGH: 'bg-amber-500', URGENT: 'bg-red-500' };
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const EVENT_COLORS = ['bg-brand-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-pink-500','bg-purple-500'];

const EV_KEY = 'taskflow_calendar_events';
function loadEvents(): CalEvent[] { try { return JSON.parse(localStorage.getItem(EV_KEY) ?? '[]'); } catch { return []; } }
function saveEvents(ev: CalEvent[]) { localStorage.setItem(EV_KEY, JSON.stringify(ev)); }

export default function CalendarPage() {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState<string | null>(null);
  const [events,    setEvents]    = useState<CalEvent[]>(loadEvents);
  const [adding,    setAdding]    = useState(false);
  const [newTitle,  setNewTitle]  = useState('');
  const [newTime,   setNewTime]   = useState('');
  const [newColor,  setNewColor]  = useState(0);

  const { data: boards = [] } = useBoards();

  // Tasks by date
  const tasksByDate = new Map<string, CalTask[]>();
  boards.forEach(b => (b.columns ?? []).forEach(col => (col.tasks ?? []).forEach(task => {
    if (!task.dueDate) return;
    const key = task.dueDate.slice(0, 10);
    if (!tasksByDate.has(key)) tasksByDate.set(key, []);
    tasksByDate.get(key)!.push({ id: task.id, title: task.title, priority: task.priority, boardName: b.name });
  })));

  // Events by date
  const eventsByDate = new Map<string, CalEvent[]>();
  events.forEach(e => {
    if (!eventsByDate.has(e.date)) eventsByDate.set(e.date, []);
    eventsByDate.get(e.date)!.push(e);
  });

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0);  } else setViewMonth(m => m + 1); };

  const mkKey = (day: number) => `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const addEvent = () => {
    if (!newTitle.trim() || !selected) return;
    const ev: CalEvent = { id: crypto.randomUUID(), title: newTitle.trim(), date: selected, color: EVENT_COLORS[newColor], time: newTime || undefined };
    const next = [...events, ev];
    setEvents(next); saveEvents(next);
    setNewTitle(''); setNewTime(''); setAdding(false);
  };

  const deleteEvent = (id: string) => {
    const next = events.filter(e => e.id !== id);
    setEvents(next); saveEvents(next);
  };

  const selectedTasks  = selected ? (tasksByDate.get(selected) ?? []) : [];
  const selectedEvents = selected ? (eventsByDate.get(selected) ?? []) : [];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Task Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View tasks by due date and manage your events.</p>
        </div>
        {selected && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            <Plus size={14} /> Add Event
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><ChevronLeft size={18} className="text-slate-500 dark:text-slate-400" /></button>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><ChevronRight size={18} className="text-slate-500 dark:text-slate-400" /></button>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700">
          {DAY_NAMES.map(d => <div key={d} className="py-2 text-center text-xs font-medium text-slate-400 dark:text-slate-500">{d}</div>)}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} className="h-24 border-b border-r border-slate-50 dark:border-slate-700/50" />;
            const dateKey   = mkKey(day);
            const tasks     = tasksByDate.get(dateKey) ?? [];
            const dayEvents = eventsByDate.get(dateKey) ?? [];
            const isToday   = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const isSelected = dateKey === selected;

            return (
              <button key={dateKey} onClick={() => setSelected(isSelected ? null : dateKey)}
                className={cn('h-24 p-1.5 text-left border-b border-r border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors', isSelected && 'bg-brand-50 dark:bg-brand-900/20')}>
                <span className={cn('text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full', isToday ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300')}>{day}</span>
                <div className="mt-0.5 space-y-0.5">
                  {tasks.slice(0, 1).map(t => (
                    <div key={t.id} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority] ?? 'bg-slate-400'}`} />
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate leading-tight">{t.title}</span>
                    </div>
                  ))}
                  {dayEvents.slice(0, 1).map(e => (
                    <div key={e.id} className={`text-[10px] text-white px-1 rounded truncate leading-tight ${e.color}`}>{e.title}</div>
                  ))}
                  {(tasks.length + dayEvents.length) > 2 && (
                    <span className="text-[10px] text-brand-600 dark:text-brand-400">+{tasks.length + dayEvents.length - 2} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="mt-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Calendar size={16} />
              {new Date(selected + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={16} /></button>
          </div>

          {/* Add event form */}
          {adding && (
            <div className="mb-4 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-700">
              <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-3">New Event</p>
              <div className="flex gap-2 mb-2">
                <input autoFocus placeholder="Event title…" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEvent()}
                  className="flex-1 text-sm border border-brand-200 dark:border-brand-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400" />
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                  className="text-sm border border-brand-200 dark:border-brand-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {EVENT_COLORS.map((c, i) => <button key={i} onClick={() => setNewColor(i)} className={cn(`w-5 h-5 rounded-full ${c} transition-transform`, newColor === i ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : '')} />)}
                </div>
                <div className="flex gap-2 ml-auto">
                  <button onClick={() => setAdding(false)} className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-white transition-colors">Cancel</button>
                  <button onClick={addEvent} className="text-xs bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg transition-colors">Add</button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Events */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Events</p>
              {selectedEvents.length === 0 ? <p className="text-xs text-slate-400 italic">No events. Click "+ Add Event" to create one.</p> : (
                <div className="space-y-2">
                  {selectedEvents.map(e => (
                    <div key={e.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700 group">
                      <div className={`w-3 h-3 rounded-full ${e.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{e.title}</p>
                        {e.time && <p className="text-xs text-slate-400">{e.time}</p>}
                      </div>
                      <button onClick={() => deleteEvent(e.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks due */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Tasks Due</p>
              {selectedTasks.length === 0 ? <p className="text-xs text-slate-400 italic">No tasks due on this date.</p> : (
                <div className="space-y-2">
                  {selectedTasks.map(t => (
                    <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700">
                      <div className={`w-2 h-2 rounded-full ${PRIORITY_DOT[t.priority] ?? 'bg-slate-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.title}</p>
                        <p className="text-xs text-slate-400">{t.boardName} · {t.priority}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
