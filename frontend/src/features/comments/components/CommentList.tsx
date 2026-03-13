import { useState, useRef, useEffect } from 'react';
import { Send, Pencil, Trash2, Check, X } from 'lucide-react';
import Avatar       from '../../../components/ui/Avatar';
import Button       from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  useComments,
  useAddComment,
  useEditComment,
  useDeleteComment,
} from '../hooks/useComments';
import { useAppSelector } from '../../../app/hooks';
import { formatRelative }  from '../../../utils/formatDate';
import { cn } from '../../../utils/cn';
import type { Comment } from '../../../types';

// ─── Single Comment Item ──────────────────────────────────────────────────────

function CommentItem({
  comment,
  isOwner,
  onEdit,
  onDelete,
  isSaving,
}: {
  comment:  Comment;
  isOwner:  boolean;
  onEdit:   (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isSaving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(comment.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      const len = draft.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editing, draft]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === comment.content) { setEditing(false); return; }
    onEdit(comment.id, trimmed);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(comment.content);
    setEditing(false);
  };

  const isEdited = comment.updatedAt !== comment.createdAt;

  return (
    <div className="flex gap-3 group">
      <Avatar
        name={comment.author.name}
        src={comment.author.avatarUrl}
        size="sm"
        className="flex-shrink-0 mt-0.5"
      />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-xs font-semibold text-slate-800">
              {comment.author.name}
            </span>
            <span className="text-xs text-slate-400">
              {formatRelative(comment.createdAt)}
            </span>
            {isEdited && (
              <span className="text-xs text-slate-400 italic">(edited)</span>
            )}
          </div>

          {isOwner && !editing && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => setEditing(true)}
                title="Edit comment"
                className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => onDelete(comment.id)}
                title="Delete comment"
                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        {editing ? (
          <div>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              rows={3}
              className={cn(
                'w-full resize-none rounded-lg border border-brand-400',
                'ring-2 ring-brand-100 px-3 py-2 text-sm text-slate-700 focus:outline-none',
              )}
            />
            <div className="flex items-center gap-2 mt-1.5">
              <Button
                size="sm"
                onClick={handleSave}
                loading={isSaving}
                disabled={!draft.trim() || isSaving}
                className="gap-1"
              >
                <Check size={12} /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} className="gap-1">
                <X size={12} /> Cancel
              </Button>
              <span className="text-xs text-slate-400 ml-auto hidden sm:block">
                ⌘↵ save · Esc cancel
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Comment Input ────────────────────────────────────────────────────────────

function CommentInput({
  currentUser,
  onSubmit,
  isPending,
}: {
  currentUser: { name: string; avatarUrl?: string } | null;
  onSubmit:    (content: string) => void;
  isPending:   boolean;
}) {
  const [content, setContent] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setContent('');
    setFocused(false);
  };

  return (
    <div className="flex gap-3">
      {currentUser && (
        <Avatar
          name={currentUser.name}
          src={currentUser.avatarUrl}
          size="sm"
          className="flex-shrink-0 mt-0.5"
        />
      )}
      <div className="flex-1">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { if (!content) setFocused(false); }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          placeholder="Write a comment… (⌘↵ to send)"
          rows={focused || content ? 3 : 2}
          className={cn(
            'w-full resize-none rounded-lg border px-3 py-2 text-sm transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400',
            'placeholder:text-slate-400 text-slate-700',
            focused || content ? 'border-brand-300' : 'border-slate-200',
          )}
        />
        {(focused || content) && (
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs text-slate-400">⌘↵ to send</span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
              loading={isPending}
              className="gap-1.5"
            >
              <Send size={12} /> Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CommentList ──────────────────────────────────────────────────────────────

export function CommentList({ taskId }: { taskId: string }) {
  const currentUser = useAppSelector(s => s.auth.user);
  const { data: comments = [], isLoading }    = useComments(taskId);
  const { mutate: addComment,  isPending: isAdding  } = useAddComment(taskId);
  const { mutate: editComment, isPending: isSaving  } = useEditComment(taskId);
  const { mutate: deleteComment } = useDeleteComment(taskId);

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-700">
        Comments{' '}
        {!isLoading && (
          <span className="font-normal text-slate-400">({comments.length})</span>
        )}
      </h4>

      <CommentInput
        currentUser={currentUser}
        onSubmit={content => addComment(content)}
        isPending={isAdding}
      />

      {isLoading ? (
        <div className="space-y-4 pt-1">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-14 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4 pt-1">
          {comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              isOwner={currentUser?.id === c.author.id}
              onEdit={(id, content) => editComment({ commentId: id, content })}
              onDelete={deleteComment}
              isSaving={isSaving}
            />
          ))}
        </div>
      )}
    </div>
  );
}
