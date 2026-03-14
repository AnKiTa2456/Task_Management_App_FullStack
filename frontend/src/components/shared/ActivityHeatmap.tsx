import { useMemo } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  /** Each entry: ISO date string "YYYY-MM-DD" */
  dates: string[];
  title?: string;
  color?: string;
  weeks?: number;
}

// Tailwind needs full class strings — use a count-to-opacity map
function countToClass(count: number, hue: 'brand' | 'emerald' | 'blue' | 'amber'): string {
  if (count === 0) return 'bg-slate-100 dark:bg-slate-700';
  const map: Record<typeof hue, string[]> = {
    brand:   ['bg-brand-100','bg-brand-300','bg-brand-500','bg-brand-700'],
    emerald: ['bg-emerald-100','bg-emerald-300','bg-emerald-500','bg-emerald-700'],
    blue:    ['bg-blue-100','bg-blue-300','bg-blue-500','bg-blue-700'],
    amber:   ['bg-amber-100','bg-amber-300','bg-amber-500','bg-amber-700'],
  };
  const idx = Math.min(Math.floor((count - 1) / 1.5), 3);
  return `${map[hue][idx]} dark:opacity-80`;
}

export default function ActivityHeatmap({
  dates,
  title = 'Activity',
  color = 'brand',
  weeks = 17,
}: Props) {
  const hue = (['brand','emerald','blue','amber'].includes(color) ? color : 'brand') as 'brand' | 'emerald' | 'blue' | 'amber';

  const { cells, monthLabels, totalCount, streak } = useMemo(() => {
    // Count per day
    const countMap = new Map<string, number>();
    dates.forEach(d => { const k = d.slice(0, 10); countMap.set(k, (countMap.get(k) ?? 0) + 1); });

    // Build grid: weeks columns × 7 rows (Sun–Sat)
    const today     = new Date();
    // Build grid: weeks columns × 7 rows (Sun–Sat), today at bottom-right
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (totalDays - 1));

    const grid: { date: string; count: number; month: number }[][] = [];
    let col: { date: string; count: number; month: number }[] = [];
    const monthPos: { label: string; col: number }[] = [];
    let prevMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const d    = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const iso  = d.toISOString().slice(0, 10);
      const day  = d.getDay();
      const mon  = d.getMonth();

      if (day === 0) col = [];
      col.push({ date: iso, count: countMap.get(iso) ?? 0, month: mon });
      if (day === 6) grid.push(col);

      if (mon !== prevMonth && day === 0) {
        monthPos.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), col: Math.floor(i / 7) });
        prevMonth = mon;
      }
    }
    // push last partial col
    if (col.length && col.length < 7) grid.push(col);

    const totalCount = dates.length;

    // Current streak
    let s = 0;
    const dd = new Date();
    while (true) {
      const key = dd.toISOString().slice(0, 10);
      if ((countMap.get(key) ?? 0) > 0) { s++; dd.setDate(dd.getDate() - 1); }
      else break;
    }

    return { cells: grid, monthLabels: monthPos, totalCount, streak: s };
  }, [dates, weeks]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span><strong className="text-slate-600 dark:text-slate-300">{totalCount}</strong> actions in the last {weeks} weeks</span>
          {streak > 0 && <span className="text-amber-500 font-semibold">🔥 {streak} day streak</span>}
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="flex mb-1 ml-7">
          {monthLabels.map(({ label, col }, i) => (
            <div key={i} className="text-[10px] text-slate-400" style={{ marginLeft: i === 0 ? `${col * 12}px` : `${(col - (monthLabels[i - 1]?.col ?? 0)) * 12 - 16}px` }}>
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1 flex-shrink-0">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => (
              <div key={day} className={cn('h-[11px] text-[9px] text-slate-400 leading-[11px]', i % 2 === 0 ? 'opacity-0' : '')}>
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Grid */}
          {cells.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, ri) => {
                const cell = col[ri];
                if (!cell) return <div key={ri} className="w-[11px] h-[11px]" />;
                const isToday = cell.date === new Date().toISOString().slice(0, 10);
                return (
                  <div
                    key={ri}
                    title={`${cell.date}: ${cell.count} action${cell.count !== 1 ? 's' : ''}`}
                    className={cn(
                      'w-[11px] h-[11px] rounded-sm transition-all cursor-default',
                      countToClass(cell.count, hue),
                      isToday && 'ring-2 ring-offset-1 ring-slate-400 dark:ring-slate-500',
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end text-[10px] text-slate-400">
        Less
        {[0, 1, 2, 4, 6].map(c => (
          <div key={c} className={cn('w-[11px] h-[11px] rounded-sm', countToClass(c, hue))} />
        ))}
        More
      </div>
    </div>
  );
}
