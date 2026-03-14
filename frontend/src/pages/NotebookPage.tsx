import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, BookOpen, ChevronRight, Eye, Edit2, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../utils/cn';

interface NotebookPage {
  id: string; title: string; content: string; createdAt: string; updatedAt: string;
}

const STORAGE_KEY = 'taskflow_notebook';
function load(): NotebookPage[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; } }
function save(pages: NotebookPage[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(pages)); }

export default function NotebookPageView() {
  const [pages,    setPages]    = useState<NotebookPage[]>(load);
  const [activeId, setActiveId] = useState<string | null>(pages[0]?.id ?? null);
  const [preview,  setPreview]  = useState(false);
  const [saved,    setSaved]    = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activePage = pages.find(p => p.id === activeId) ?? null;

  // Persist when pages change
  useEffect(() => { save(pages); }, [pages]);

  const newPage = () => {
    const page: NotebookPage = { id: crypto.randomUUID(), title: 'Untitled', content: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setPages(prev => [page, ...prev]);
    setActiveId(page.id);
    setPreview(false);
  };

  const deletePage = (id: string) => {
    setPages(prev => { const next = prev.filter(p => p.id !== id); if (activeId === id) setActiveId(next[0]?.id ?? null); return next; });
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

  const wordCount = activePage?.content.trim().split(/\s+/).filter(Boolean).length ?? 0;
  const charCount = activePage?.content.length ?? 0;

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)] flex gap-4">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><BookOpen size={15} /> Pages</span>
          <button onClick={newPage} className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 transition-colors"><Plus size={14} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {pages.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 px-4">No pages yet. Create one!</p>
          ) : (
            pages.map(page => (
              <button key={page.id} onClick={() => setActiveId(page.id)}
                className={cn('w-full flex items-center gap-2 px-3 py-2.5 text-left group transition-colors', activeId === page.id ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400')}>
                <ChevronRight size={12} className={cn('flex-shrink-0', activeId === page.id ? 'opacity-100' : 'opacity-0')} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{page.title || 'Untitled'}</p>
                  <p className="text-[10px] text-slate-300 dark:text-slate-600">{new Date(page.updatedAt).toLocaleDateString()}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); deletePage(page.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-400 transition-all"><Trash2 size={11} /></button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
        {activePage ? (
          <>
            {/* Toolbar */}
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <input
                value={activePage.title}
                onChange={e => updateTitle(activePage.id, e.target.value)}
                placeholder="Page title…"
                className="flex-1 text-base font-bold text-slate-800 dark:text-slate-100 bg-transparent outline-none placeholder-slate-300"
              />
              <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
                {!saved ? (
                  <span className="flex items-center gap-1 text-amber-500"><Save size={11} className="animate-pulse" /> Saving…</span>
                ) : (
                  <span className="text-slate-300 dark:text-slate-600">Saved</span>
                )}
                <span>·</span>
                <span>{wordCount}w</span>
                <span>·</span>
                <span>{charCount}c</span>
              </div>
              <div className="flex gap-1 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                <button onClick={() => setPreview(false)} className={cn('px-2.5 py-1.5 text-xs flex items-center gap-1 transition-colors', !preview ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700')}>
                  <Edit2 size={11} /> Edit
                </button>
                <button onClick={() => setPreview(true)} className={cn('px-2.5 py-1.5 text-xs flex items-center gap-1 transition-colors', preview ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700')}>
                  <Eye size={11} /> Preview
                </button>
              </div>
            </div>

            {/* Content area */}
            {preview ? (
              <div className="flex-1 overflow-y-auto px-8 py-6 prose prose-sm dark:prose-invert max-w-none">
                {activePage.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{activePage.content}</ReactMarkdown>
                ) : (
                  <p className="text-slate-400 italic">Nothing to preview yet. Switch to Edit mode to write.</p>
                )}
              </div>
            ) : (
              <textarea
                value={activePage.content}
                onChange={e => updateContent(activePage.id, e.target.value)}
                placeholder={`Start writing here...\n\nTips:\n# Heading 1\n## Heading 2\n**bold** _italic_\n- list item\n1. numbered list\n> blockquote\n\`code\`\n\`\`\`\ncode block\n\`\`\``}
                className="flex-1 px-8 py-6 text-sm text-slate-700 dark:text-slate-200 bg-transparent resize-none outline-none leading-relaxed placeholder-slate-300 dark:placeholder-slate-600 font-mono"
              />
            )}

            <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 flex items-center gap-3">
              <span>Last edited {new Date(activePage.updatedAt).toLocaleString()}</span>
              <span>·</span>
              <span className="text-slate-300 dark:text-slate-600">Markdown supported</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <BookOpen size={48} className="opacity-20 mb-4" />
            <p className="font-medium text-slate-500 dark:text-slate-400">No page selected</p>
            <p className="text-sm mt-1">Create a new page or select one from the list.</p>
            <button onClick={newPage} className="mt-4 flex items-center gap-2 text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors"><Plus size={14} /> New Page</button>
          </div>
        )}
      </div>
    </div>
  );
}
