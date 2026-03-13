import { cn } from '../../utils/cn';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title:      string;
  value:      string | number;
  change?:    string;
  positive?:  boolean;
  icon:       LucideIcon;
  iconColor?: string;
  iconBg?:    string;
}

export default function StatsCard({
  title, value, change, positive, icon: Icon, iconColor = 'text-brand-600', iconBg = 'bg-brand-50',
}: StatsCardProps) {
  return (
    <div className="stat-card flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {change && (
          <p className={cn('text-xs mt-0.5', positive ? 'text-emerald-600' : 'text-red-500')}>
            {positive ? '↑' : '↓'} {change}
          </p>
        )}
      </div>
    </div>
  );
}
