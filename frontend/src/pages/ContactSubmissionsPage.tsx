import { useState, useEffect } from 'react';
import { Mail, Phone, User, Clock, MessageSquare, Edit3, Check, Trash2, Search } from 'lucide-react';
import { cn } from '../utils/cn';

interface ContactSubmission {
  id:          string;
  name:        string;
  email:       string;
  phone:       string;
  message:     string;
  notes:       string;
  submittedAt: string;
}

const STORAGE_KEY = 'taskflow_contact_submissions';

function load(): ContactSubmission[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}
function save(subs: ContactSubmission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(load);
  const [selected,    setSelected]    = useState<ContactSubmission | null>(null);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText,    setNoteText]    = useState('');
  const [search,      setSearch]      = useState('');

  useEffect(() => { save(submissions); }, [submissions]);

  const filtered = submissions.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  const deleteSubmission = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const saveNote = (id: string) => {
    const updated = submissions.map(s => s.id === id ? { ...s, notes: noteText } : s);
    setSubmissions(updated);
    setSelected(updated.find(s => s.id === id) ?? null);
    setEditingNote(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare size={20} /> Contact Submissions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Messages from people who contacted you — sent to p.ankita10101@gmail.com
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400 w-52"
          />
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-10rem)]">
        {/* List panel */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-xs text-slate-400 font-medium">
            {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No submissions yet</p>
              </div>
            ) : (
              filtered.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelected(sub)}
                  className={cn(
                    'w-full text-left px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors',
                    selected?.id === sub.id && 'bg-brand-50 dark:bg-brand-900/20',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{sub.name}</p>
                      <p className="text-xs text-slate-400 truncate">{sub.email}</p>
                    </div>
                    <span className="text-xs text-slate-300 dark:text-slate-600 flex-shrink-0">
                      {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{sub.message}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {selected ? (
            <div className="flex flex-col h-full">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{selected.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(selected.submittedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteSubmission(selected.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Contact details */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: User,  label: 'Name',  value: selected.name  },
                    { icon: Mail,  label: 'Email', value: selected.email },
                    { icon: Phone, label: 'Phone', value: selected.phone },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                        <Icon size={13} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Message</p>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{selected.message}</p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">My Notes</p>
                    {!editingNote ? (
                      <button
                        onClick={() => { setNoteText(selected.notes); setEditingNote(true); }}
                        className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        <Edit3 size={11} /> {selected.notes ? 'Edit' : 'Add note'}
                      </button>
                    ) : (
                      <button
                        onClick={() => saveNote(selected.id)}
                        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <Check size={11} /> Save
                      </button>
                    )}
                  </div>
                  {editingNote ? (
                    <textarea
                      autoFocus
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      rows={4}
                      placeholder="Add a private note about this contact..."
                      className="w-full p-3 text-sm border-2 border-brand-200 dark:border-brand-700 rounded-xl bg-transparent text-slate-700 dark:text-slate-200 outline-none resize-none"
                    />
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 min-h-[80px]">
                      {selected.notes ? (
                        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{selected.notes}</p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No notes yet. Click "Add note" to add your private notes.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 h-full">
              <div className="text-center">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Select a submission to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
