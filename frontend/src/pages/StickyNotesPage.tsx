import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';

interface StickyNote {
  id: string;
  content: string;
  color: string;
  createdAt: string;
  pinned: boolean;
}

const COLORS = [
  { bg: 'bg-yellow-100 dark:bg-yellow-900/40', border: 'border-yellow-200 dark:border-yellow-700', label: 'Yellow' },
  { bg: 'bg-pink-100 dark:bg-pink-900/40',     border: 'border-pink-200 dark:border-pink-700',     label: 'Pink'   },
  { bg: 'bg-blue-100 dark:bg-blue-900/40',     border: 'border-blue-200 dark:border-blue-700',     label: 'Blue'   },
  { bg: 'bg-green-100 dark:bg-green-900/40',   border: 'border-green-200 dark:border-green-700',   label: 'Green'  },
  { bg: 'bg-purple-100 dark:bg-purple-900/40', border: 'border-purple-200 dark:border-purple-700', label: 'Purple' },
  { bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-200 dark:border-orange-700', label: 'Orange' },
];

const STORAGE_KEY = 'taskflow_sticky_notes';

function load(): StickyNote[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}
function save(notes: StickyNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export default function StickyNotesPage() {
  const [notes,     setNotes]    = useState<StickyNote[]>(load);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText,  setEditText]  = useState('');
  const [newText,   setNewText]   = useState('');
  const [newColor,  setNewColor]  = useState(0);
  const [adding,    setAdding]    = useState(false);

  useEffect(() => { save(notes); }, [notes]);

  const addNote = () => {
    if (!newText.trim()) return;
    const note: StickyNote = {
      id:        crypto.randomUUID(),
      content:   newText.trim(),
      color:     String(newColor),
      createdAt: new Date().toISOString(),
      pinned:    false,
    };
    setNotes(prev => [note, ...prev]);
    setNewText('');
    setAdding(false);
  };

  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  const startEdit = (note: StickyNote) => {
    setEditingId(note.id);
    setEditText(note.content);
  };

  const saveEdit = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content: editText } : n));
    setEditingId(null);
  };

  const togglePin = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const sortedNotes = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sticky Notes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Quick notes and reminders.</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* New note form */}
      {adding && (
        <div className={`mb-6 rounded-2xl border-2 p-4 ${COLORS[newColor].bg} ${COLORS[newColor].border}`}>
          <textarea
            autoFocus
            placeholder="Write your note here..."
            value={newText}
            onChange={e => setNewText(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 resize-none outline-none min-h-[80px] placeholder-slate-400"
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addNote(); }}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              {COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setNewColor(i)}
                  className={`w-5 h-5 rounded-full ${c.bg.split(' ')[0]} border-2 transition-transform ${newColor === i ? 'scale-125 border-slate-500' : 'border-transparent'}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-colors">
                Cancel
              </button>
              <button onClick={addNote} className="text-xs bg-slate-800 dark:bg-slate-600 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {sortedNotes.length === 0 && !adding ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-3">📝</div>
          <p className="font-medium">No sticky notes yet</p>
          <p className="text-sm mt-1">Click "New Note" to capture a quick thought.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedNotes.map(note => {
            const colorIdx = parseInt(note.color) || 0;
            const color    = COLORS[colorIdx] ?? COLORS[0];
            const isEditing = editingId === note.id;

            return (
              <div
                key={note.id}
                className={`relative rounded-2xl border-2 p-4 min-h-[140px] flex flex-col ${color.bg} ${color.border} group transition-shadow hover:shadow-md`}
              >
                {note.pinned && (
                  <span className="absolute -top-1.5 left-4 text-xs bg-slate-700 text-white px-2 py-0.5 rounded-full">
                    Pinned
                  </span>
                )}

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => togglePin(note.id)}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                    className="p-1 rounded-md bg-white/60 dark:bg-slate-700/60 hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-colors text-xs"
                  >
                    📌
                  </button>
                  {!isEditing && (
                    <button onClick={() => startEdit(note)} className="p-1 rounded-md bg-white/60 dark:bg-slate-700/60 hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-colors">
                      <Edit2 size={12} />
                    </button>
                  )}
                  <button onClick={() => deleteNote(note.id)} className="p-1 rounded-md bg-white/60 dark:bg-slate-700/60 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-400 transition-colors">
                    <X size={12} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  {isEditing ? (
                    <textarea
                      autoFocus
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 resize-none outline-none min-h-[80px]"
                    />
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
                      {note.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400">
                    {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {isEditing && (
                    <button onClick={() => saveEdit(note.id)} className="flex items-center gap-1 text-xs bg-slate-800 dark:bg-slate-600 text-white px-2 py-1 rounded-lg">
                      <Check size={10} /> Save
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
