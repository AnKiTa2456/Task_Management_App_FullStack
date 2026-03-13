/**
 * features/dashboard/components/StatCard.tsx
 * WHERE USED: DashboardPage — row of 4 stat cards at the top.
 */

import { type ReactNode } from 'react';
import { TrendingUp }     from 'lucide-react';
import { cn }             from '../../../utils/cn';

interface StatCardProps {
  label:       string;
  value:       number | string;
  icon:        ReactNode;
  iconBg:      string;
  change?:     number;   // +/- percentage vs last period
  suffix?:     string;
}

export function StatCard({ label, value, icon, iconBg, change, suffix }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card flex items-start gap-4">
      <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-800">
          {value}{suffix && <span className="text-sm font-medium text-slate-400 ml-0.5">{suffix}</span>}
        </p>
        {change !== undefined && (
          <div className={cn(
            'mt-1 flex items-center gap-0.5 text-xs font-medium',
            change >= 0 ? 'text-emerald-600' : 'text-red-500',
          )}>
            <TrendingUp size={11} className={change < 0 ? 'rotate-180' : ''} />
            {Math.abs(change)}% vs last week
          </div>
        )}
      </div>
    </div>
  );
}
