import { useState, useEffect, useRef } from 'react';
import { Search, UserCheck } from 'lucide-react';
import Modal       from '../../../components/ui/Modal';
import Button      from '../../../components/ui/Button';
import Avatar      from '../../../components/ui/Avatar';
import { Select }  from '../../../components/ui/Select';
import { useInviteMember } from '../hooks/useTeams';
import { usersApi } from '../../../services/api';
import type { Role, User } from '../../../types';

interface Props { teamId: string; isOpen: boolean; onClose: () => void }

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'ADMIN',  label: 'Admin'  },
  { value: 'VIEWER', label: 'Viewer' },
];

export function InviteModal({ teamId, isOpen, onClose }: Props) {
  const { mutate: invite, isPending } = useInviteMember(teamId);

  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState<User[]>([]);
  const [selected,  setSelected]  = useState<User | null>(null);
  const [role,      setRole]      = useState<Role>('MEMBER');
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await usersApi.search(query.trim());
        setResults(users);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleClose = () => {
    setQuery(''); setResults([]); setSelected(null); setRole('MEMBER');
    onClose();
  };

  const handleInvite = () => {
    if (!selected) return;
    invite(
      { email: selected.email, role },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title="Invite team member">
      <div className="space-y-4">
        {/* Search box */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Search by name or email
          </label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null); }}
              placeholder="e.g. alice or alice@company.com"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {results.length > 0 && !selected && (
            <ul className="mt-1 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              {results.map(u => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => { setSelected(u); setQuery(u.name); setResults([]); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 text-left"
                  >
                    <Avatar name={u.name} src={u.avatarUrl} size="xs" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 truncate">{u.name}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {searching && <p className="text-xs text-slate-400 mt-1 px-1">Searching…</p>}
          {query.length >= 2 && !searching && results.length === 0 && !selected && (
            <p className="text-xs text-slate-400 mt-1 px-1">No registered users found.</p>
          )}
        </div>

        {/* Selected user preview */}
        {selected && (
          <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2.5">
            <Avatar name={selected.name} src={selected.avatarUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{selected.name}</p>
              <p className="text-xs text-slate-500 truncate">{selected.email}</p>
            </div>
            <UserCheck size={16} className="text-brand-600 flex-shrink-0" />
          </div>
        )}

        <Select
          label="Role"
          options={ROLE_OPTIONS}
          value={role}
          onChange={e => setRole(e.target.value as Role)}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button loading={isPending} disabled={!selected} onClick={handleInvite}>
            Send invite
          </Button>
        </div>
      </div>
    </Modal>
  );
}
