import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, CheckCircle2, StickyNote, BookOpen, Target, Clock } from 'lucide-react';
import { useBoards } from '../../features/boards';
import { cn } from '../../utils/cn';

interface SearchResult {
  id:       string;
  title:    string;
  subtitle: string;
  type:     'task' | 'note' | 'notebook' | 'habit' | 'board';
  link:     string;
  icon:     React.ReactNode;
}

function loadNotes(): { id: string; content: string }[] {
  try { return JSON.parse(localStorage.getItem('taskflow_sticky_notes') ?? '[]'); } catch { return []; }
}
function loadPages(): { id: string; title: string; content: string }[] {
  try { return JSON.parse(localStorage.getItem('taskflow_notebook') ?? '[]'); } catch { return []; }
}
function loadHabits(): { id: string; name: string; emoji: string }[] {
  try { return JSON.parse(localStorage.getItem('taskflow_habits') ?? '[]'); } catch { return []; }
}

export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { data: boards = [] } = useBoards();
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [idx,     setIdx]     = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    const out: SearchResult[] = [];

    // Boards
    boards.forEach(b => {
      if (b.name.toLowerCase().includes(lower))
        out.push({ id: b.id, title: b.name, subtitle: 'Board', type: 'board', link: `/board/${b.id}`, icon: <CheckCircle2 size={14} className="text-brand-500" /> });
    });

    // Tasks
    boards.forEach(b => {
      (b.columns ?? []).forEach(col => {
        (col.tasks ?? []).forEach(t => {
          if (t.title.toLowerCase().includes(lower) || (t.description ?? '').toLowerCase().includes(lower))
            out.push({ id: t.id, title: t.title, subtitle: `${b.name} · ${col.name}`, type: 'task', link: `/board/${b.id}`, icon: <CheckCircle2 size={14} className="text-blue-500" /> });
        });
      });
    });

    // Sticky notes
    loadNotes().forEach(n => {
      if (n.content.toLowerCase().includes(lower))
        out.push({ id: n.id, title: n.content.slice(0, 60), subtitle: 'Sticky Note', type: 'note', link: '/sticky-notes', icon: <StickyNote size={14} className="text-yellow-500" /> });
    });

    // Notebook pages
    loadPages().forEach(p => {
      if (p.title.toLowerCase().includes(lower) || p.content.toLowerCase().includes(lower))
        out.push({ id: p.id, title: p.title || 'Untitled', subtitle: 'Notebook', type: 'notebook', link: '/notebook', icon: <BookOpen size={14} className="text-purple-500" /> });
    });

    // Habits
    loadHabits().forEach(h => {
      if (h.name.toLowerCase().includes(lower))
        out.push({ id: h.id, title: `${h.emoji} ${h.name}`, subtitle: 'Habit', type: 'habit', link: '/habits', icon: <Target size={14} className="text-emerald-500" /> });
    });

    setResults(out.slice(0, 10));
    setIdx(0);
  }, [boards]);

  useEffect(() => { if (open) { setQuery(''); setResults([]); setIdx(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  useEffect(() => { search(query); }, [query, search]);

  const pick = (r: SearchResult) => { navigate(r.link); onClose(); };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[idx]) pick(results[idx]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, idx]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Search box */}
      <div className="relative w-full max-w-xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-700">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks, notes, habits, boards…"
            className="flex-1 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-none placeholder-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:flex text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">Esc</kbd>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((r, i) => (
              <li key={r.id + r.type}>
                <button
                  onClick={() => pick(r)}
                  onMouseEnter={() => setIdx(i)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    i === idx ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700',
                  )}
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {r.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{r.title}</p>
                    <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>
                  </div>
                  <span className="text-xs text-slate-300 dark:text-slate-600 capitalize flex-shrink-0">{r.type}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : query.trim() ? (
          <div className="py-10 text-center text-slate-400">
            <Search size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No results for "{query}"</p>
          </div>
        ) : (
          <div className="py-6 px-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Timeline',   link: '/timeline',     icon: <Clock size={14} />     },
                { label: 'Habits',     link: '/habits',       icon: <Target size={14} />    },
                { label: 'Sticky Notes', link: '/sticky-notes', icon: <StickyNote size={14} /> },
                { label: 'Notebook',   link: '/notebook',     icon: <BookOpen size={14} />  },
              ].map(({ label, link, icon }) => (
                <button
                  key={link}
                  onClick={() => { navigate(link); onClose(); }}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="text-slate-400">{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4 text-xs text-slate-400">
          <span><kbd className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">↵</kbd> select</span>
          <span><kbd className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
