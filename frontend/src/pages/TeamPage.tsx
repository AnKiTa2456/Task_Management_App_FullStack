import { useState }      from 'react';
import { UserPlus, Crown, Shield, User, Eye } from 'lucide-react';
import Button            from '../components/ui/Button';
import { MemberList }    from '../features/teams/components/MemberList';
import { InviteModal }   from '../features/teams/components/InviteModal';
import type { Role }     from '../types';

const DEMO_TEAM = {
  id: 'team-1',
  name: 'TaskFlow Team',
  slug: 'taskflow',
  members: [
    { id: 'm1', role: 'OWNER'  as Role, joinedAt: '2024-01-15T00:00:00Z', user: { id: '1', name: 'Alex Morgan',  email: 'alex@example.com',   avatarUrl: undefined, createdAt: '' } },
    { id: 'm2', role: 'ADMIN'  as Role, joinedAt: '2024-02-01T00:00:00Z', user: { id: '2', name: 'Sarah Chen',   email: 'sarah@example.com',  avatarUrl: undefined, createdAt: '' } },
    { id: 'm3', role: 'MEMBER' as Role, joinedAt: '2024-02-14T00:00:00Z', user: { id: '3', name: 'Jordan Lee',   email: 'jordan@example.com', avatarUrl: undefined, createdAt: '' } },
    { id: 'm4', role: 'MEMBER' as Role, joinedAt: '2024-03-01T00:00:00Z', user: { id: '4', name: 'Morgan Blake', email: 'morgan@example.com', avatarUrl: undefined, createdAt: '' } },
    { id: 'm5', role: 'VIEWER' as Role, joinedAt: '2024-03-10T00:00:00Z', user: { id: '5', name: 'Casey Park',   email: 'casey@example.com',  avatarUrl: undefined, createdAt: '' } },
  ],
};

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ReactNode; color: string }> = {
  OWNER:  { label: 'Owner',  icon: <Crown  size={12} />, color: 'bg-amber-100 text-amber-700' },
  ADMIN:  { label: 'Admin',  icon: <Shield size={12} />, color: 'bg-brand-100 text-brand-700' },
  MEMBER: { label: 'Member', icon: <User   size={12} />, color: 'bg-slate-100 text-slate-600' },
  VIEWER: { label: 'Viewer', icon: <Eye    size={12} />, color: 'bg-green-100 text-green-700' },
};

export default function TeamPage() {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{DEMO_TEAM.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{DEMO_TEAM.members.length} members</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="gap-1.5">
          <UserPlus size={16} /> Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(Object.keys(ROLE_CONFIG) as Role[]).map(role => {
          const count = DEMO_TEAM.members.filter(m => m.role === role).length;
          const { label, icon, color } = ROLE_CONFIG[role];
          return (
            <div key={role} className="bg-white rounded-xl p-4 shadow-card border border-slate-100">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium mb-2 ${color}`}>
                {icon} {label}
              </div>
              <p className="text-2xl font-bold text-slate-800">{count}</p>
            </div>
          );
        })}
      </div>

      <MemberList teamId={DEMO_TEAM.id} members={DEMO_TEAM.members} />
      <InviteModal teamId={DEMO_TEAM.id} isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
