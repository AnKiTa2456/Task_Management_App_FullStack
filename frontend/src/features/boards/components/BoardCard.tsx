import { useNavigate }   from 'react-router-dom';
import { Lock, Users, ChevronRight } from 'lucide-react';
import Avatar        from '../../../components/ui/Avatar';
import { cn }            from '../../../utils/cn';
import type { Board }    from '../../../types';

const BG = ['from-brand-500 to-brand-700','from-violet-500 to-purple-700',
             'from-rose-500 to-pink-700','from-emerald-500 to-teal-700','from-amber-500 to-orange-700'];

export function BoardCard({ board }: { board: Board }) {
  const navigate = useNavigate();
  const gradient = BG[board.name.charCodeAt(0) % BG.length];

  return (
    <button
      onClick={() => navigate(`/board/${board.id}`)}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden text-left w-full',
        'border border-slate-200 bg-white shadow-card',
        'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200',
      )}
    >
      <div className={cn('h-24 bg-gradient-to-br', gradient)} />
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
              {board.name}
              {board.isPrivate && <Lock size={12} className="text-slate-400" />}
            </p>
            {board.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{board.description}</p>
            )}
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-brand-500 transition-colors flex-shrink-0 mt-0.5" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">{board.columns.length} columns</span>
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-slate-400" />
            <Avatar name={board.owner.name} src={board.owner.avatarUrl} size="xs" />
          </div>
        </div>
      </div>
    </button>
  );
}
