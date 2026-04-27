import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, BookOpen, ChevronRight, ChevronLeft, Eye, Edit2, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../utils/cn';

interface NotebookPage {
  id: string; title: string; content: string; createdAt: string; updatedAt: string;
}

const STORAGE_KEY = 'taskflow_notebook';
function load(): NotebookPage[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; } }
function save(pages: NotebookPage[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(pages)); }

function createDefaultPage(): NotebookPage {
  return { id: crypto.randomUUID(), title: 'Page 1', content: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

function loadOrInit(): NotebookPage[] {
  const pages = load();
  if (pages.length > 0) return pages;
  const def = createDefaultPage();
  save([def]);
  return [def];
}

export default function NotebookPageView() {
  const [pages,    setPages]    = useState<NotebookPage[]>(loadOrInit);
  const [activeId, setActiveId] = useState<string | null>(pages[0]?.id ?? null);
  const [preview,  setPreview]  = useState(false);
  const [saved,    setSaved]    = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activePage   = pages.find(p => p.id === activeId) ?? null;
  const currentIndex = pages.findIndex(p => p.id === activeId);
  const hasPrev      = currentIndex > 0;
  const hasNext      = currentIndex < pages.length - 1;

  useEffect(() => { save(pages); }, [pages]);

  const newPage = () => {
    const page: NotebookPage = {
      id: crypto.randomUUID(), title: 'Untitled', content: '',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setPages(prev => [...prev, page]);
    setActiveId(page.id);
    setPreview(false);
  };

  const deletePage = (id: string) => {
    setPages(prev => {
      const next = prev.filter(p => p.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
  };

  const updateTitle = (id: string, title: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, title, updatedAt: new Date().toISOString() } : p));
  };

  const updateContent = useCallback((id: string, content: string) => {
    setSaved(false);
    setPages(prev => prev.map(p => p.id === id ? { ...p, content, updatedAt: new Date().toISOString() } : p));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(true), 800);
  }, []);

  const navigatePage = (dir: 'prev' | 'next') => {
    if (dir === 'prev' && hasPrev) { setActiveId(pages[currentIndex - 1].id); setPreview(false); }
    if (dir === 'next' && hasNext) { setActiveId(pages[currentIndex + 1].id); setPreview(false); }
  };

  const wordCount = activePage?.content.trim().split(/\s+/).filter(Boolean).length ?? 0;
  const charCount = activePage?.content.length ?? 0;

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)] flex gap-3 min-w-0 overflow-hidden">

      {/* ── Sidebar — hidden on small screens ── */}
      <div className="hidden sm:flex w-56 lg:w-64 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex-col overflow-hidden">
        <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <BookOpen size={13} className="text-brand-500" /> Notebook
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              {pages.length}
            </span>
            <button
              onClick={newPage}
              title="New page"
              className="p-1 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1.5 px-1.5 space-y-0.5">
          {pages.map((page, idx) => (
              <button
                key={page.id}
                onClick={() => { setActiveId(page.id); setPreview(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left group transition-all',
                  activeId === page.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400',
                )}
              >
                <span className={cn(
                  'text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center flex-shrink-0',
                  activeId === page.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400',
                )}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium truncate', activeId === page.id ? 'text-white' : '')}>
                    {page.title || 'Untitled'}
                  </p>
                  <p className={cn('text-[10px] mt-0.5', activeId === page.id ? 'text-white/60' : 'text-slate-300 dark:text-slate-600')}>
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deletePage(page.id); }}
                  className={cn(
                    'opacity-0 group-hover:opacity-100 p-1 rounded transition-all',
                    activeId === page.id
                      ? 'hover:bg-white/20 text-white/70 hover:text-white'
                      : 'text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
                  )}
                >
                  <Trash2 size={10} />
                </button>
              </button>
            ))}
        </div>
      </div>

      {/* ── Editor ── */}
      <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">

        {/* Mobile-only: compact page selector (no + button) */}
        <div className="sm:hidden px-3 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60">
          <select
            value={activeId ?? ''}
            onChange={e => { setActiveId(e.target.value); setPreview(false); }}
            className="flex-1 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-brand-500"
          >
            {pages.map((p, i) => (
              <option key={p.id} value={p.id}>
                {i + 1}. {p.title || 'Untitled'}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 flex-shrink-0">{currentIndex + 1}/{pages.length}</span>
        </div>

        {activePage && (
          <>
            {/* Toolbar */}
            <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50/60 dark:bg-slate-800/60">
              <input
                value={activePage.title}
                onChange={e => updateTitle(activePage.id, e.target.value)}
                placeholder="Page title…"
                className="flex-1 min-w-0 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 bg-transparent outline-none placeholder-slate-300"
              />
              <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
                {!saved ? (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Save size={10} className="animate-pulse" />
                    <span className="hidden sm:inline">Saving…</span>
                  </span>
                ) : (
                  <span className="text-emerald-500">✓</span>
                )}
                <span className="hidden sm:inline text-slate-400">{wordCount}w · {charCount}c</span>
              </div>
              <div className="flex border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setPreview(false)}
                  className={cn(
                    'px-2 sm:px-3 py-1.5 text-xs flex items-center gap-1 transition-colors',
                    !preview ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700',
                  )}
                >
                  <Edit2 size={10} /> <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setPreview(true)}
                  className={cn(
                    'px-2 sm:px-3 py-1.5 text-xs flex items-center gap-1 transition-colors',
                    preview ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700',
                  )}
                >
                  <Eye size={10} /> <span className="hidden sm:inline">Preview</span>
                </button>
              </div>
            </div>

            {/* Content */}
            {preview ? (
              <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-4 sm:py-8 prose prose-sm dark:prose-invert max-w-none">
                {activePage.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{activePage.content}</ReactMarkdown>
                ) : (
                  <p className="text-slate-400 italic">Nothing to preview. Switch to Edit mode.</p>
                )}
              </div>
            ) : (
              <textarea
                value={activePage.content}
                onChange={e => updateContent(activePage.id, e.target.value)}
                placeholder={`Start writing…\n\n# Heading 1\n**bold**  _italic_\n- list item`}
                className="flex-1 px-4 sm:px-10 py-4 sm:py-8 text-sm text-slate-700 dark:text-slate-200 bg-transparent resize-none outline-none leading-relaxed placeholder-slate-300 dark:placeholder-slate-600 font-mono"
              />
            )}

            {/* ── Page navigation ── */}
            <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/40">
              <button
                onClick={() => navigatePage('prev')}
                disabled={!hasPrev}
                className={cn(
                  'flex items-center gap-1 text-xs font-medium px-2 sm:px-3 py-1.5 rounded-lg transition-colors',
                  hasPrev
                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    : 'text-slate-200 dark:text-slate-700 cursor-not-allowed',
                )}
              >
                <ChevronLeft size={13} />
                <span className="hidden sm:inline">{hasPrev ? (pages[currentIndex - 1].title || 'Previous') : 'Previous'}</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tabular-nums">
                {currentIndex + 1} / {pages.length}
              </span>

              <button
                onClick={() => navigatePage('next')}
                disabled={!hasNext}
                className={cn(
                  'flex items-center gap-1 text-xs font-medium px-2 sm:px-3 py-1.5 rounded-lg transition-colors',
                  hasNext
                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    : 'text-slate-200 dark:text-slate-700 cursor-not-allowed',
                )}
              >
                <span className="hidden sm:inline">{hasNext ? (pages[currentIndex + 1].title || 'Next') : 'Next'}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
