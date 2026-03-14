import { useState }      from 'react';
import { UserPlus, Crown, Shield, User, Eye, Loader2, Users, Plus } from 'lucide-react';
import Button            from '../components/ui/Button';
import Input             from '../components/ui/Input';
import Modal             from '../components/ui/Modal';
import { MemberList }    from '../features/teams/components/MemberList';
import { InviteModal }   from '../features/teams/components/InviteModal';
import { useTeams, useCreateTeam } from '../features/teams/hooks/useTeams';
import type { Role }     from '../types';

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ReactNode; color: string }> = {
  OWNER:  { label: 'Owner',  icon: <Crown  size={12} />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  ADMIN:  { label: 'Admin',  icon: <Shield size={12} />, color: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' },
  MEMBER: { label: 'Member', icon: <User   size={12} />, color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  VIEWER: { label: 'Viewer', icon: <Eye    size={12} />, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

export default function TeamPage() {
  const { data: teams = [], isLoading } = useTeams();
  const { mutate: createTeam, isPending: isCreating } = useCreateTeam();

  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [createOpen,    setCreateOpen]    = useState(false);
  const [selectedIdx,   setSelectedIdx]   = useState(0);
  const [newTeamName,   setNewTeamName]   = useState('');
  const [newTeamSlug,   setNewTeamSlug]   = useState('');

  const team = teams[selectedIdx] ?? null;

  const handleCreateTeam = () => {
    if (!newTeamName.trim() || !newTeamSlug.trim()) return;
    createTeam(
      { name: newTeamName.trim(), slug: newTeamSlug.trim().toLowerCase().replace(/\s+/g, '-') },
      {
        onSuccess: () => {
          setNewTeamName(''); setNewTeamSlug('');
          setCreateOpen(false);
          setSelectedIdx(teams.length); // select the new team
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Team</h1>
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus size={16} /> Create Team
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-52 bg-white dark:bg-slate-800
                        rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <Users size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No teams yet</p>
          <p className="text-xs text-slate-400 mt-1">Create a team to start inviting members</p>
          <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>Create team</Button>
        </div>
        <CreateTeamModal
          open={createOpen}
          name={newTeamName}
          slug={newTeamSlug}
          onName={v => { setNewTeamName(v); setNewTeamSlug(v.toLowerCase().replace(/\s+/g, '-')); }}
          onSlug={v => setNewTeamSlug(v)}
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreateTeam}
          isPending={isCreating}
        />
      </div>
    );
  }

  const members = (team as unknown as { members?: typeof team extends { members: infer M } ? M : [] })?.members ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          {/* Team selector if multiple teams */}
          {teams.length > 1 ? (
            <select
              value={selectedIdx}
              onChange={e => setSelectedIdx(Number(e.target.value))}
              className="text-xl font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none
                         focus:outline-none cursor-pointer"
            >
              {teams.map((t, i) => <option key={t.id} value={i}>{t.name}</option>)}
            </select>
          ) : (
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{team?.name}</h1>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {(members as { id: string }[]).length} member{(members as { id: string }[]).length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus size={14} /> New Team
          </Button>
          <Button onClick={() => setInviteOpen(true)} className="gap-1.5">
            <UserPlus size={16} /> Invite Member
          </Button>
        </div>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(Object.keys(ROLE_CONFIG) as Role[]).map(role => {
          const count = (members as { role: Role }[]).filter(m => m.role === role).length;
          const { label, icon, color } = ROLE_CONFIG[role];
          return (
            <div key={role} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card border border-slate-100 dark:border-slate-700">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium mb-2 ${color}`}>
                {icon} {label}
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{count}</p>
            </div>
          );
        })}
      </div>

      <MemberList teamId={team!.id} members={members as Parameters<typeof MemberList>[0]['members']} />
      <InviteModal teamId={team!.id} isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
      <CreateTeamModal
        open={createOpen}
        name={newTeamName}
        slug={newTeamSlug}
        onName={v => { setNewTeamName(v); setNewTeamSlug(v.toLowerCase().replace(/\s+/g, '-')); }}
        onSlug={v => setNewTeamSlug(v)}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateTeam}
        isPending={isCreating}
      />
    </div>
  );
}

function CreateTeamModal({ open, name, slug, onName, onSlug, onClose, onCreate, isPending }: {
  open: boolean; name: string; slug: string;
  onName: (v: string) => void; onSlug: (v: string) => void;
  onClose: () => void; onCreate: () => void; isPending: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Create team">
      <div className="space-y-4">
        <Input
          label="Team name"
          placeholder="e.g. Design Team"
          value={name}
          onChange={e => onName(e.target.value)}
          autoFocus
        />
        <Input
          label="Slug (URL identifier)"
          placeholder="e.g. design-team"
          value={slug}
          onChange={e => onSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onCreate} loading={isPending} disabled={!name.trim() || !slug.trim()}>
            Create team
          </Button>
        </div>
      </div>
    </Modal>
  );
}
