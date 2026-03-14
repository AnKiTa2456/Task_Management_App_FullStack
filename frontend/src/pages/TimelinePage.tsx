import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, Circle, ChevronDown, ChevronUp, Calendar, Plus, StickyNote, Pencil, Trash2, Check, X } from 'lucide-react';
import { useBoards } from '../features/boards';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type Status   = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

interface TimelineTask {
  id: string; title: string; status: Status; priority: Priority;
  boardName: string; columnName: string; dueDate?: string;
  assigneeName?: string; date: Date;
}

interface TimelineNote {
  id: string; title: string; content: string; createdAt: string; updatedAt: string;
}

const NOTES_KEY = 'taskflow_timeline_notes';

function loadNotes(): TimelineNote[] {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) ?? '[]'); } catch { return []; }
}
function saveNotes(n: TimelineNote[]) { localStorage.setItem(NOTES_KEY, JSON.stringify(n)); }

const priorityColors: Record<Priority, string> = {
  LOW:    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  HIGH:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const statusIcons: Record<Status, React.ReactElement> = {
  TODO:        <Circle      size={14} className="text-slate-400" />,
  IN_PROGRESS: <Clock       size={14} className="text-blue-500" />,
  IN_REVIEW:   <AlertCircle size={14} className="text-amber-500" />,
  DONE:        <CheckCircle2 size={14} className="text-emerald-500" />,
};

function isToday(d: Date) {
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}
function isYesterday(d: Date) {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
}
function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// ─── Notes Section ────────────────────────────────────────────────────────────

function NotesSection({ notes, onAdd, onUpdate, onDelete }: {
  notes: TimelineNote[];
  onAdd: (title: string, content: string) => void;
  onUpdate: (id: string, title: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [adding, setAdding]   = useState(false);
  const [nTitle, setNTitle]   = useState('');
  const [nContent, setNContent] = useState('');
  const [editId, setEditId]   = useState<string | null>(null);
  const [editTitle, setEditTitle]     = useState('');
  const [editContent, setEditContent] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const canSave = !!(nTitle.trim() || nContent.trim());

  const handleAdd = () => {
    if (!canSave) return;
    const title   = nTitle.trim()   || nContent.trim().slice(0, 60);
    const content = nContent.trim() || nTitle.trim();
    onAdd(title, content);
    setNTitle(''); setNContent(''); setAdding(false);
  };

  const startEdit = (note: TimelineNote) => {
    setEditId(note.id); setEditTitle(note.title); setEditContent(note.content);
  };

  const handleSave = (id: string) => {
    if (!editTitle.trim() && !editContent.trim()) return;
    const title   = editTitle.trim()   || editContent.trim().slice(0, 60);
    const content = editContent.trim() || editTitle.trim();
    onUpdate(id, title, content);
    setEditId(null);
  };

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-3 h-3 rounded-full bg-yellow-400 flex-shrink-0" />
        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Notes &amp; Updates</span>
        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{notes.length}</span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
        <button
          onClick={() => setAdding(a => !a)}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={13} /> Add Note
        </button>
      </div>

      <div className="ml-6 border-l-2 border-slate-100 dark:border-slate-700 pl-5 space-y-3">
        {/* Add form */}
        {adding && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4">
            <input
              autoFocus
              placeholder="Note title (optional)…"
              value={nTitle}
              onChange={e => setNTitle(e.target.value)}
              className="w-full text-sm font-medium bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 mb-2"
            />
            <textarea
              placeholder="Write your note or update here…"
              value={nContent}
              onChange={e => setNContent(e.target.value)}
              rows={3}
              className="w-full text-sm bg-transparent outline-none resize-none text-slate-600 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => { setAdding(false); setNTitle(''); setNContent(''); }} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={!canSave} className="text-xs bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition-colors">
                Save Note
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 && !adding && (
          <p className="text-sm text-slate-400 py-2">No notes yet. Click "Add Note" to capture an update.</p>
        )}

        {notes.map(note => (
          <div key={note.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {editId === note.id ? (
              /* Edit mode */
              <div className="p-4">
                <input
                  autoFocus
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full text-sm font-semibold bg-transparent outline-none text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 mb-2 pb-1"
                />
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full text-sm bg-transparent outline-none resize-none text-slate-600 dark:text-slate-300 mt-2"
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => setEditId(null)} className="text-xs p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <X size={14} />
                  </button>
                  <button onClick={() => handleSave(note.id)} className="text-xs p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                    <Check size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* Read mode */
              <div>
                <button
                  onClick={() => setExpanded(expanded === note.id ? null : note.id)}
                  className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <StickyNote size={14} className="text-yellow-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{note.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs text-slate-400">
                      {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {expanded === note.id ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
                  </div>
                </button>

                {expanded === note.id && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-slate-700">
                      <span className="text-xs text-slate-300 dark:text-slate-600">
                        Added {new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(note)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => onDelete(note.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Task Section ─────────────────────────────────────────────────────────────

function TimelineSection({
  label, tasks, defaultOpen = true, accent,
}: { label: string; tasks: TimelineTask[]; defaultOpen?: boolean; accent: string }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 mb-3 group">
        <div className={`w-3 h-3 rounded-full ${accent} flex-shrink-0`} />
        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{label}</span>
        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{tasks.length}</span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      {open && (
        <div className="ml-6 border-l-2 border-slate-100 dark:border-slate-700 pl-5 space-y-3">
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No tasks for this period.</p>
          ) : tasks.map(task => (
            <div key={task.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {statusIcons[task.status]}
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{task.title}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">{task.boardName}</span>
                <span>•</span>
                <span>{task.columnName}</span>
                {task.dueDate && (
                  <><span>•</span><span className="flex items-center gap-1"><Calendar size={11} />Due {new Date(task.dueDate).toLocaleDateString()}</span></>
                )}
                {task.assigneeName && (
                  <><span>•</span><span>{task.assigneeName}</span></>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const { data: boards = [] } = useBoards();
  const [notes, setNotes] = useState<TimelineNote[]>(loadNotes);

  const addNote = (title: string, content: string) => {
    const now = new Date().toISOString();
    const newNote: TimelineNote = { id: crypto.randomUUID(), title, content, createdAt: now, updatedAt: now };
    setNotes(prev => {
      const updated = [newNote, ...prev];
      saveNotes(updated);
      return updated;
    });
  };
  const updateNote = (id: string, title: string, content: string) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n);
      saveNotes(updated);
      return updated;
    });
  };
  const deleteNote = (id: string) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveNotes(updated);
      return updated;
    });
  };

  const allTasks: TimelineTask[] = boards.flatMap(board =>
    (board.columns ?? []).flatMap(col =>
      (col.tasks ?? []).map(task => ({
        id: task.id, title: task.title,
        status:       task.status as Status,
        priority:     task.priority as Priority,
        boardName:    board.name,
        columnName:   col.name,
        dueDate:      task.dueDate ?? undefined,
        assigneeName: task.assignee?.name ?? undefined,
        date:         new Date(task.updatedAt ?? task.createdAt ?? Date.now()),
      }))
    )
  );

  const todayTasks     = allTasks.filter(t => isToday(t.date));
  const yesterdayTasks = allTasks.filter(t => isYesterday(t.date));

  const olderMap = new Map<string, TimelineTask[]>();
  allTasks.filter(t => !isToday(t.date) && !isYesterday(t.date)).forEach(t => {
    const key = t.date.toDateString();
    if (!olderMap.has(key)) olderMap.set(key, []);
    olderMap.get(key)!.push(t);
  });
  const olderGroups = Array.from(olderMap.entries())
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto space-y-2 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Timeline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tasks organised by date — plus your notes &amp; updates.
          </p>
        </div>
      </div>

      {/* Notes at the top */}
      <NotesSection notes={notes} onAdd={addNote} onUpdate={updateNote} onDelete={deleteNote} />

      {/* Task sections */}
      <TimelineSection label="Today"     tasks={todayTasks}     defaultOpen accent="bg-brand-500" />
      <TimelineSection label="Yesterday" tasks={yesterdayTasks} defaultOpen accent="bg-blue-400"  />
      {olderGroups.map(([dateStr, tasks]) => (
        <TimelineSection key={dateStr} label={formatDate(new Date(dateStr))} tasks={tasks} defaultOpen={false} accent="bg-slate-300" />
      ))}

      {allTasks.length === 0 && notes.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <Clock size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nothing here yet</p>
          <p className="text-sm mt-1">Add a note above, or create tasks on your boards to see them here.</p>
        </div>
      )}
    </div>
  );
}
