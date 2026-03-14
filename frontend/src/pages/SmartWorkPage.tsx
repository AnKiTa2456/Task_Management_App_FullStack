import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Star, Clock, Zap } from 'lucide-react';
import { cn } from '../utils/cn';

type SmartStatus   = 'TODO' | 'IN_PROGRESS' | 'DONE';
type SmartPriority = 'LOW' | 'MEDIUM' | 'HIGH';

interface SmartItem {
  id:          string;
  title:       string;
  description: string;
  priority:    SmartPriority;
  status:      SmartStatus;
  estimate:    number; // hours
  starred:     boolean;
  createdAt:   string;
  completedAt: string | null;
}

const STORAGE_KEY = 'taskflow_smart_work';

function load(): SmartItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}
function save(items: SmartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const PRIORITY_STYLES: Record<SmartPriority, string> = {
  LOW:    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  HIGH:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const STATUS_FILTER_OPTIONS: { value: SmartStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',         label: 'All'         },
  { value: 'TODO',        label: 'To Do'       },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done'        },
];

export default function SmartWorkPage() {
  const [items,  setItems]  = useState<SmartItem[]>(load);
  const [filter, setFilter] = useState<SmartStatus | 'ALL'>('ALL');
  const [adding, setAdding] = useState(false);

  const [title,    setTitle]    = useState('');
  const [desc,     setDesc]     = useState('');
  const [priority, setPriority] = useState<SmartPriority>('MEDIUM');
  const [estimate, setEstimate] = useState(1);

  const addItem = () => {
    if (!title.trim()) return;
    const item: SmartItem = {
      id:          crypto.randomUUID(),
      title:       title.trim(),
      description: desc.trim(),
      priority,
      status:      'TODO',
      estimate,
      starred:     false,
      createdAt:   new Date().toISOString(),
      completedAt: null,
    };
    setItems(prev => { const updated = [item, ...prev]; save(updated); return updated; });
    setTitle(''); setDesc(''); setPriority('MEDIUM'); setEstimate(1);
    setAdding(false);
  };

  const cycleStatus = (id: string) => {
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id !== id) return item;
        const next: Record<SmartStatus, SmartStatus> = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'TODO' };
        const newStatus = next[item.status];
        return { ...item, status: newStatus, completedAt: newStatus === 'DONE' ? new Date().toISOString() : null };
      });
      save(updated);
      return updated;
    });
  };

  const toggleStar = (id: string) => setItems(prev => { const updated = prev.map(i => i.id === id ? { ...i, starred: !i.starred } : i); save(updated); return updated; });
  const deleteItem = (id: string) => setItems(prev => { const updated = prev.filter(i => i.id !== id); save(updated); return updated; });

  const filtered = items
    .filter(i => filter === 'ALL' || i.status === filter)
    .sort((a, b) => Number(b.starred) - Number(a.starred));

  const doneCount  = items.filter(i => i.status === 'DONE').length;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Zap size={20} className="text-amber-500" /> Smart Work
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Plan and track focused work sessions.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Add Work
        </button>
      </div>

      {/* Stats bar */}
      {items.length > 0 && (() => {
        const pct = Math.round((doneCount / items.length) * 100);
        const inProgressCount = items.filter(i => i.status === 'IN_PROGRESS').length;
        const barColor = pct === 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-brand-500' : pct >= 30 ? 'bg-amber-500' : 'bg-slate-400';
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Completion Progress</p>
              <span className={cn('text-lg font-black', pct === 100 ? 'text-emerald-600' : pct >= 60 ? 'text-brand-600 dark:text-brand-400' : 'text-amber-600')}>{pct}%</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
              <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{items.length}</p>
                <p className="text-[10px] text-slate-400">Total</p>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-lg font-bold text-slate-500">{items.filter(i => i.status === 'TODO').length}</p>
                <p className="text-[10px] text-slate-400">To Do</p>
              </div>
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{inProgressCount}</p>
                <p className="text-[10px] text-slate-400">In Progress</p>
              </div>
              <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-lg font-bold text-emerald-600">{doneCount}</p>
                <p className="text-[10px] text-slate-400">Done</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add form */}
      {adding && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-brand-200 dark:border-brand-700 p-5 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Add Smart Work Item</h3>
          <div className="space-y-3">
            <input
              autoFocus
              placeholder="What needs to get done?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400"
            />
            <textarea
              placeholder="Brief description (optional)..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={2}
              className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-transparent text-slate-700 dark:text-slate-200 resize-none outline-none focus:border-brand-400"
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as SmartPriority)}
                  className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Estimate (hours)</label>
                <input
                  type="number" min={0.5} max={24} step={0.5}
                  value={estimate}
                  onChange={e => setEstimate(parseFloat(e.target.value) || 1)}
                  className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setAdding(false)} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button onClick={addItem} className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors">
              Add Item
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {items.length > 0 && (
        <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 w-fit">
          {STATUS_FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                filter === opt.value
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Items list */}
      {filtered.length === 0 && !adding ? (
        <div className="text-center py-20 text-slate-400">
          <Zap size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">{items.length === 0 ? 'No work items yet' : 'No items match this filter'}</p>
          <p className="text-sm mt-1">{items.length === 0 ? 'Add your first smart work item above.' : 'Try a different filter.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div
              key={item.id}
              className={cn(
                'bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4',
                'flex items-start gap-3 group hover:shadow-md transition-shadow',
                item.status === 'DONE' && 'opacity-60',
              )}
            >
              <button onClick={() => cycleStatus(item.id)} className="mt-0.5 flex-shrink-0">
                {item.status === 'DONE'
                  ? <CheckCircle2 size={18} className="text-emerald-500" />
                  : item.status === 'IN_PROGRESS'
                    ? <div className="w-[18px] h-[18px] rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    : <Circle size={18} className="text-slate-300 dark:text-slate-600" />
                }
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={cn('text-sm font-medium text-slate-800 dark:text-slate-100', item.status === 'DONE' && 'line-through text-slate-400')}>
                    {item.title}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[item.priority]}`}>
                    {item.priority}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {item.estimate}h estimated
                  </span>
                  {item.status === 'IN_PROGRESS' && (
                    <span className="text-blue-500 font-medium">In Progress</span>
                  )}
                  {item.completedAt && (
                    <span className="text-emerald-500">Done {new Date(item.completedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleStar(item.id)}
                  className={cn('p-1.5 rounded-lg transition-colors', item.starred ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400')}
                >
                  <Star size={14} fill={item.starred ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
