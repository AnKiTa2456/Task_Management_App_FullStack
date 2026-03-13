import { useState }  from 'react';
import { Trash2, Crown } from 'lucide-react';
import Avatar           from '../../../components/ui/Avatar';
import { Badge }        from '../../../components/ui/Badge';
import Button           from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { useRemoveMember } from '../hooks/useTeams';
import { useAppSelector }  from '../../../app/hooks';
import { ROLE_LABEL }      from '../../../utils/constants';
import { formatDate }      from '../../../utils/formatDate';
import type { TeamMember } from '../../../types';

interface MemberListProps { teamId: string; members: TeamMember[] }

export function MemberList({ teamId, members }: MemberListProps) {
  const currentUser = useAppSelector(s => s.auth.user);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const { mutate: removeMember, isPending } = useRemoveMember(teamId);

  return (
    <>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
            <Avatar name={m.user.name} src={m.user.avatarUrl} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-slate-800 truncate">{m.user.name}</p>
                {m.role === 'OWNER' && <Crown size={12} className="text-amber-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 truncate">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="text-xs">{ROLE_LABEL[m.role]}</Badge>
              <span className="text-xs text-slate-400 hidden sm:block">Joined {formatDate(m.joinedAt)}</span>
              {m.role !== 'OWNER' && currentUser?.id !== m.user.id && (
                <Button variant="ghost" size="sm" onClick={() => setRemoving(m)} className="text-slate-400 hover:text-red-500 p-1.5">
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={!!removing} onClose={() => setRemoving(null)}
        onConfirm={() => { if (removing) removeMember(removing.user.id, { onSuccess: () => setRemoving(null) }); }}
        title="Remove member"
        description={`Remove ${removing?.user.name} from this team? They will lose access to all team boards.`}
        confirmLabel="Remove" isLoading={isPending} danger
      />
    </>
  );
}
