/**
 * layouts/AuthLayout.tsx
 *
 * WHAT: Wrapper for login/register pages.
 * WHY:  Provides consistent branding panel + form container.
 *       Keeps auth pages decoupled from AppLayout (no sidebar/navbar).
 */

import { Outlet } from 'react-router-dom';
import { Trello } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Left: Branding panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between bg-brand-600 px-12 py-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Trello size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">TaskFlow</span>
        </div>

        {/* Tagline */}
        <div>
          <blockquote className="text-white/90 text-xl font-medium leading-relaxed">
            "The secret of getting ahead is getting started. Break your work
            into manageable tasks and crush them one by one."
          </blockquote>
          <p className="mt-4 text-white/60 text-sm">— TaskFlow, your team's command center</p>
        </div>

        {/* Stats row */}
        <div className="flex gap-8">
          {[
            { label: 'Teams',       value: '12k+' },
            { label: 'Tasks Done',  value: '2M+'  },
            { label: 'Uptime',      value: '99.9%'},
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form area ── */}
      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Trello size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">TaskFlow</span>
          </div>

          <Outlet />
        </div>
      </div>

    </div>
  );
}
