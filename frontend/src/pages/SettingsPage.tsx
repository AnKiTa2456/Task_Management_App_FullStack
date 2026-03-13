import { useState } from 'react';
import { User, Bell, Lock, Palette } from 'lucide-react';
import Avatar  from '../components/ui/Avatar';
import Button  from '../components/ui/Button';
import Input   from '../components/ui/Input';
import { useAppSelector } from '../app/hooks';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',       label: 'Profile',       icon: <User      size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell      size={16} /> },
  { id: 'security',      label: 'Security',       icon: <Lock      size={16} /> },
  { id: 'appearance',    label: 'Appearance',     icon: <Palette   size={16} /> },
];

export default function SettingsPage() {
  const { user }   = useAppSelector(s => s.auth);
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <nav className="w-44 flex-shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'sidebar-link w-full text-left',
                tab === t.id && 'active',
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-card border border-slate-100 p-6">
          {tab === 'profile' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-700">Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                {user && <Avatar name={user.name} size="lg" />}
                <div>
                  <Button variant="outline" size="sm">Change photo</Button>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <Input label="Bio" placeholder="Tell your team about yourself..." />

              <div className="flex justify-end">
                <Button onClick={() => toast.success('Profile updated!')}>
                  Save changes
                </Button>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-700">Notification Preferences</h2>
              <div className="space-y-3">
                {[
                  { label: 'Task assigned to me',   sub: 'When someone assigns you a task' },
                  { label: 'Task comments',          sub: 'When someone comments on your task' },
                  { label: 'Due date reminders',     sub: '24 hours before a task is due' },
                  { label: 'Board activity',         sub: "Updates to boards you're a member of" },
                  { label: 'Team invitations',       sub: 'When you receive a team invite' },
                ].map(item => (
                  <NotificationToggle key={item.label} label={item.label} sub={item.sub} />
                ))}
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-700">Change Password</h2>
              <Input label="Current password" type="password" placeholder="••••••••" />
              <Input label="New password"     type="password" placeholder="Min. 8 characters" />
              <Input label="Confirm password" type="password" placeholder="••••••••" />
              <div className="flex justify-end">
                <Button onClick={() => toast.success('Password updated!')}>
                  Update password
                </Button>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-700">Appearance</h2>
              <div>
                <p className="text-xs font-medium text-slate-600 mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['Light', 'Dark', 'System'] as const).map(t => (
                    <button
                      key={t}
                      className={cn(
                        'border-2 rounded-xl p-3 text-sm font-medium transition-colors',
                        t === 'Light'
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({ label, sub }: { label: string; sub: string }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
      <button
        onClick={() => setEnabled(v => !v)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
          enabled ? 'bg-brand-600' : 'bg-slate-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
            enabled ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}
