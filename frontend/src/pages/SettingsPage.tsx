import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, Palette, LogOut, Sun, Moon, Monitor, Upload, Link2 } from 'lucide-react';
import Avatar  from '../components/ui/Avatar';
import Button  from '../components/ui/Button';
import Input   from '../components/ui/Input';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout, setCredentials } from '../features/auth/authSlice';
import { setTheme } from '../features/ui/uiSlice';
import { usersApi } from '../services/api';
import { cn }       from '../utils/cn';
import toast        from 'react-hot-toast';
import type { ThemeMode } from '../features/ui/uiSlice';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',       label: 'Profile',       icon: <User    size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell    size={16} /> },
  { id: 'security',      label: 'Security',       icon: <Lock    size={16} /> },
  { id: 'appearance',    label: 'Appearance',     icon: <Palette size={16} /> },
];

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light',  label: 'Light',  icon: <Sun     size={20} /> },
  { value: 'dark',   label: 'Dark',   icon: <Moon    size={20} /> },
  { value: 'system', label: 'System', icon: <Monitor size={20} /> },
];

// Convert Google Drive share URL → direct image URL
function convertDriveUrl(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
}

// Resize + compress image to ≤200px, return base64 JPEG
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const size = 200;
        const canvas = document.createElement('canvas');
        const ratio  = Math.min(size / img.width, size / img.height);
        canvas.width  = img.width  * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SettingsPage() {
  const dispatch      = useAppDispatch();
  const navigate      = useNavigate();
  const { user, accessToken } = useAppSelector(s => s.auth);
  const { theme }     = useAppSelector(s => s.ui);

  const [tab,        setTab]        = useState<SettingsTab>('profile');
  const [name,       setName]       = useState(user?.name ?? '');
  const [bio,        setBio]        = useState(user?.bio ?? '');
  const [avatarUrl,  setAvatarUrl]  = useState(user?.avatarUrl ?? '');
  const [driveUrl,   setDriveUrl]   = useState('');
  const [saving,     setSaving]     = useState(false);
  const [photoMode,  setPhotoMode]  = useState<'preview' | 'url' | 'drive'>('preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [savingPw,   setSavingPw]   = useState(false);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    try {
      const base64 = await compressImage(file);
      setAvatarUrl(base64);
      setPhotoMode('preview');
      toast.success('Photo ready — click Save to apply');
    } catch {
      toast.error('Failed to process image');
    }
    e.target.value = '';
  };

  const handleDriveApply = () => {
    if (!driveUrl.trim()) return;
    const converted = convertDriveUrl(driveUrl.trim());
    setAvatarUrl(converted);
    setDriveUrl('');
    setPhotoMode('preview');
    toast.success('Drive image applied — click Save to update');
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile({
        name:      name.trim(),
        bio:       bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      dispatch(setCredentials({ user: { ...user!, ...updated }, accessToken: accessToken ?? '' }));
      toast.success('Profile updated!');
      navigate(-1);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { toast.error('All fields are required'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 8)   { toast.error('Min. 8 characters'); return; }
    setSavingPw(true);
    try {
      const { apiClient } = await import('../lib/axios');
      await apiClient.patch('/users/password', { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      toast.success('Password updated!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    /* Clicking the grey page background navigates back */
    <div
      className="min-h-[calc(100vh-4rem)] -m-6 p-6 cursor-default"
      onClick={() => navigate(-1)}
    >
    <div
      className="space-y-6 animate-fade-in max-w-3xl cursor-default"
      onClick={e => e.stopPropagation()}
    >
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <nav className="w-44 flex-shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'sidebar-link w-full text-left dark:text-slate-400 dark:hover:bg-slate-700',
                tab === t.id && 'active dark:!bg-brand-900/40 dark:!text-brand-400',
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
            <button
              onClick={handleLogout}
              className="sidebar-link w-full text-left !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </nav>

        {/* Panel */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-100 dark:border-slate-700 p-6">

          {/* ── Profile ── */}
          {tab === 'profile' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Profile Information</h2>

              {/* Avatar section */}
              <div className="flex items-start gap-5">
                <div className="relative">
                  <Avatar name={name || user?.name || ''} src={avatarUrl || undefined} size="lg" />
                </div>

                <div className="flex-1 space-y-3">
                  {/* Upload buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                                 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300
                                 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Upload size={13} /> Upload from computer
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoMode(photoMode === 'drive' ? 'preview' : 'drive')}
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                        photoMode === 'drive'
                          ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
                      )}
                    >
                      <Link2 size={13} /> From Google Drive
                    </button>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* Google Drive input */}
                  {photoMode === 'drive' && (
                    <div className="flex gap-2">
                      <input
                        value={driveUrl}
                        onChange={e => setDriveUrl(e.target.value)}
                        placeholder="Paste Google Drive share link…"
                        className="flex-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5
                                   focus:outline-none focus:ring-2 focus:ring-brand-500
                                   bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleDriveApply}
                        className="px-3 py-1.5 text-xs font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-400">
                    Upload JPG/PNG/WebP (auto-resized to 200×200) or paste a Google Drive share link.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full name" value={name} onChange={e => setName(e.target.value)} />
                <Input label="Email" type="email" value={user?.email ?? ''} disabled />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell your team about yourself…"
                  maxLength={500}
                  className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                             bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
                             placeholder:text-slate-400 resize-none"
                />
                <p className="text-xs text-slate-400 mt-0.5 text-right">{bio.length}/500</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} loading={saving} disabled={!name.trim()}>
                  Save changes
                </Button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {tab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notification Preferences</h2>
              <div className="space-y-2">
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

          {/* ── Security ── */}
          {tab === 'security' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Change Password</h2>
              <Input label="Current password" type="password" placeholder="••••••••"
                value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
              <Input label="New password" type="password" placeholder="Min. 8 characters"
                value={newPw} onChange={e => setNewPw(e.target.value)} />
              <Input label="Confirm new password" type="password" placeholder="••••••••"
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} loading={savingPw}>Update password</Button>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {tab === 'appearance' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Appearance</h2>
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => dispatch(setTheme(opt.value))}
                      className={cn(
                        'flex flex-col items-center gap-2.5 border-2 rounded-xl py-4 px-3',
                        'text-sm font-medium transition-all',
                        theme === opt.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                          : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50',
                      )}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  {theme === 'system'
                    ? 'Follows your OS light/dark preference automatically.'
                    : theme === 'dark' ? 'Dark mode is active.' : 'Light mode is active.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

function NotificationToggle({ label, sub }: { label: string; sub: string }) {
  const storageKey = `notif_${label.replace(/\s+/g, '_').toLowerCase()}`;
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved === null ? true : saved === 'true';
  });

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(storageKey, String(next));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150 text-left',
        enabled
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30'
          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700',
      )}
    >
      <div className="flex-1 min-w-0 pr-4">
        <p className={cn(
          'text-sm font-medium',
          enabled ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200',
        )}>
          {label}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>
      </div>
      <span className={cn(
        'text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0',
        enabled
          ? 'bg-brand-600 text-white'
          : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300',
      )}>
        {enabled ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}
