import { useState, useEffect } from 'react';
import {
  X, Calendar, Tag, User, Flag,
  MessageSquare, Clock, Pencil, Trash2, AlertTriangle,
  CheckSquare, Square, Plus as PlusIcon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setSelectedTask } from '../../features/tasks/tasksSlice';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import Avatar        from '../ui/Avatar';
import Button        from '../ui/Button';
import Input         from '../ui/Input';
import { Textarea }  from '../ui/Textarea';
import { Select }    from '../ui/Select';
import { formatDate, formatRelative } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import { CommentList }    from '../../features/comments/components/CommentList';
import { useTaskActivity } from '../../features/comments/hooks/useComments';
import { useUpdateTask, useDeleteTask } from '../../features/tasks/hooks/useTasks';
import { Skeleton } from '../ui/Skeleton';
import type { Activity, Priority, TaskStatus } from '../../types';

// ─── Subtasks ─────────────────────────────────────────────────────────────────

interface Subtask { id: string; title: string; done: boolean; }

function SubtasksSection({ taskId }: { taskId: string }) {
  const key = `taskflow_subtasks_${taskId}`;
  const [subtasks, setSubtasks] = useState<Subtask[]>(() => {
    try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
  });
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => { localStorage.setItem(key, JSON.stringify(subtasks)); }, [subtasks, key]);

  const add = () => {
    if (!newTitle.trim()) return;
    setSubtasks(prev => [...prev, { id: crypto.randomUUID(), title: newTitle.trim(), done: false }]);
    setNewTitle(''); setAdding(false);
  };
  const toggle = (id: string) => setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  const remove  = (id: string) => setSubtasks(prev => prev.filter(s => s.id !== id));

  const doneCount = subtasks.filter(s => s.done).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <CheckSquare size={13} /> Subtasks
          {subtasks.length > 0 && <span className="text-slate-300">({doneCount}/{subtasks.length})</span>}
        </p>
        <button onClick={() => setAdding(a => !a)} className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><PlusIcon size={13} /></button>
      </div>
      {subtasks.length > 0 && (
        <div className="mb-2 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${(doneCount / subtasks.length) * 100}%` }} />
        </div>
      )}
      <div className="space-y-1 mb-2">
        {subtasks.map(s => (
          <div key={s.id} className="flex items-center gap-2 group">
            <button onClick={() => toggle(s.id)} className="flex-shrink-0 text-slate-400 hover:text-brand-600 transition-colors">
              {s.done ? <CheckSquare size={14} className="text-brand-600" /> : <Square size={14} />}
            </button>
            <span className={`flex-1 text-xs ${s.done ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>{s.title}</span>
            <button onClick={() => remove(s.id)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-300 hover:text-red-400 transition-all"><X size={10} /></button>
          </div>
        ))}
      </div>
      {adding && (
        <div className="flex gap-2">
          <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="Subtask title…" className="flex-1 text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-transparent text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400" />
          <button onClick={add} className="text-xs bg-brand-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-brand-700 transition-colors">Add</button>
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskDetailPanelProps {
  boardId: string;
}

// ─── Option lists ─────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'LOW',    label: 'Low'    },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH',   label: 'High'   },
  { value: 'URGENT', label: 'Urgent' },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'TODO',        label: 'To Do'       },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW',   label: 'In Review'   },
  { value: 'DONE',        label: 'Done'        },
];

// ─── Activity helpers ─────────────────────────────────────────────────────────

function activityLabel(a: Activity): string {
  const meta = a.metadata as Record<string, string>;
  switch (a.type) {
    case 'TASK_CREATED':    return 'created this task';
    case 'TASK_UPDATED':    return 'updated this task';
    case 'TASK_MOVED':      return `moved from "${meta.fromColumn}" → "${meta.toColumn}"`;
    case 'TASK_ASSIGNED':   return `assigned to ${meta.assigneeName ?? 'someone'}`;
    case 'TASK_UNASSIGNED': return 'removed the assignee';
    case 'COMMENT_ADDED':
      return `commented: "${(meta.preview ?? '').slice(0, 60)}${(meta.preview?.length ?? 0) >= 60 ? '…' : ''}"`;
    case 'COMMENT_EDITED':  return 'edited a comment';
    case 'COMMENT_DELETED': return 'deleted a comment';
    case 'MEMBER_ADDED':    return 'was added to the board';
    default:                return a.type.toLowerCase().replace(/_/g, ' ');
  }
}

function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="flex gap-2.5 text-xs">
      <Avatar name={activity.user.name} src={activity.user.avatarUrl} size="xs" className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p>
          <span className="font-semibold text-slate-700">{activity.user.name}</span>
          {' '}
          <span className="text-slate-500">{activityLabel(activity)}</span>
        </p>
        <p className="text-slate-400 mt-0.5">{formatRelative(activity.createdAt)}</p>
      </div>
    </div>
  );
}

function ActivityFeed({ taskId }: { taskId: string }) {
  const { data: activities = [], isLoading } = useTaskActivity(taskId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-2.5">
            <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-2.5 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-6">No activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map(a => <ActivityItem key={a.id} activity={a} />)}
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

type Tab = 'comments' | 'activity';

function TabBar({ active, onChange, commentCount }: {
  active: Tab; onChange: (t: Tab) => void; commentCount: number;
}) {
  return (
    <div className="flex border-b border-slate-100 flex-shrink-0">
      {([
        { key: 'comments' as Tab, icon: <MessageSquare size={14} />, label: 'Comments', badge: commentCount },
        { key: 'activity' as Tab, icon: <Clock size={14} />,         label: 'Activity',  badge: 0 },
      ]).map(({ key, icon, label, badge }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            active === key
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          {icon} {label}
          {badge > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.5 leading-none">
              {badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Delete confirmation ──────────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel, isLoading }: {
  onConfirm: () => void; onCancel: () => void; isLoading: boolean;
}) {
  return (
    <div className="mx-5 my-4 rounded-xl border border-red-100 bg-red-50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-red-700">
        <AlertTriangle size={16} className="flex-shrink-0" />
        <p className="text-sm font-medium">Delete this task?</p>
      </div>
      <p className="text-xs text-red-600">
        This action cannot be undone. All comments and activity will be lost.
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button
          size="sm"
          loading={isLoading}
          onClick={onConfirm}
          className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white !border-transparent"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

// ─── TaskDetailPanel ──────────────────────────────────────────────────────────

export default function TaskDetailPanel({ boardId }: TaskDetailPanelProps) {
  const dispatch = useAppDispatch();
  const task     = useAppSelector(s => s.tasks.selected);

  const [activeTab,         setActiveTab]         = useState<Tab>('comments');
  const [isEditing,         setIsEditing]         = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit form local state
  const [editTitle,       setEditTitle]       = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority,    setEditPriority]    = useState<Priority>('MEDIUM');
  const [editStatus,      setEditStatus]      = useState<TaskStatus>('TODO');
  const [editDueDate,     setEditDueDate]     = useState('');

  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(task?.id ?? '', boardId);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(boardId);

  if (!task) return null;

  const openEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    setShowDeleteConfirm(false);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    updateTask(
      {
        title:       editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority:    editPriority,
        status:      editStatus,
        dueDate:     editDueDate || undefined,
      },
      {
        onSuccess: (updated) => {
          dispatch(setSelectedTask(updated));
          setIsEditing(false);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteTask(task.id, {
      onSuccess: () => dispatch(setSelectedTask(null)),
    });
  };

  const closePanel = () => {
    dispatch(setSelectedTask(null));
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      {/* Backdrop — closes panel when clicking outside on all screen sizes */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={closePanel} />

      {/* Panel */}
      <aside className={cn(
        'fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50',
        'flex flex-col border-l border-slate-100 animate-slide-in',
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <StatusBadge status={task.status} />
          <div className="flex items-center gap-1">
            <button
              onClick={isEditing ? () => setIsEditing(false) : openEdit}
              title={isEditing ? 'Cancel edit' : 'Edit task'}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isEditing
                  ? 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600',
              )}
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => { setShowDeleteConfirm(v => !v); setIsEditing(false); }}
              title="Delete task"
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                showDeleteConfirm
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600',
              )}
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={closePanel}
              title="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto flex flex-col">

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <DeleteConfirm
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteConfirm(false)}
              isLoading={isDeleting}
            />
          )}

          {/* Edit form */}
          {isEditing && !showDeleteConfirm && (
            <div className="p-5 space-y-3">
              <Input
                label="Title"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                autoFocus
              />
              <Textarea
                label="Description"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                rows={3}
                placeholder="Describe this task…"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Priority"
                  options={PRIORITY_OPTIONS}
                  value={editPriority}
                  onChange={e => setEditPriority(e.target.value as Priority)}
                />
                <Select
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as TaskStatus)}
                />
              </div>
              <Input
                label="Due date"
                type="date"
                value={editDueDate}
                onChange={e => setEditDueDate(e.target.value)}
              />
              <div className="flex gap-2 pt-1">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  loading={isUpdating}
                  disabled={!editTitle.trim()}
                  onClick={handleSave}
                >
                  Save changes
                </Button>
              </div>
            </div>
          )}

          {/* Read view */}
          {!isEditing && (
            <div className="p-5 space-y-5 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 leading-snug">{task.title}</h2>
                {task.description && (
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{task.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetaItem icon={<Flag size={14} />} label="Priority">
                  <PriorityBadge priority={task.priority} />
                </MetaItem>

                <MetaItem icon={<User size={14} />} label="Assignee">
                  {task.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar name={task.assignee.name} size="xs" />
                      <span className="text-xs text-slate-700">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Unassigned</span>
                  )}
                </MetaItem>

                {task.dueDate && (
                  <MetaItem icon={<Calendar size={14} />} label="Due date">
                    <span className="text-xs text-slate-700">{formatDate(task.dueDate)}</span>
                  </MetaItem>
                )}

                <MetaItem icon={<User size={14} />} label="Created by">
                  <div className="flex items-center gap-1.5">
                    <Avatar name={task.creator?.name ?? 'Unknown'} size="xs" />
                    <span className="text-xs text-slate-700">{task.creator?.name ?? 'Unknown'}</span>
                  </div>
                </MetaItem>
              </div>

              {task.labels.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                    <Tag size={13} /> Labels
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels.map(l => (
                      <span
                        key={l.id}
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: l.color }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <SubtasksSection taskId={task.id} />
              </div>
            </div>
          )}

          {/* Tabs + content (always visible when not editing) */}
          {!isEditing && (
            <>
              <div className="border-t border-slate-100" />
              <TabBar active={activeTab} onChange={setActiveTab} commentCount={task.comments?.length ?? 0} />
              <div className="p-5 flex-1">
                {activeTab === 'comments'
                  ? <CommentList taskId={task.id} />
                  : <ActivityFeed taskId={task.id} />
                }
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 flex-shrink-0">
          Updated {formatRelative(task.updatedAt)}
        </div>
      </aside>
    </>
  );
}

// ─── MetaItem ─────────────────────────────────────────────────────────────────

function MetaItem({ icon, label, children }: {
  icon: React.ReactNode; label: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-400 flex items-center gap-1 mb-1.5">{icon} {label}</p>
      {children}
    </div>
  );
}
