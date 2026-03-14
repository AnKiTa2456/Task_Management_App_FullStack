import { useState } from 'react';
import { Download, FileText, FileJson, Table2, CheckCircle2 } from 'lucide-react';
import { useBoards } from '../features/boards';
import { cn } from '../utils/cn';

type Format = 'csv' | 'json';
type Dataset = 'tasks' | 'notes' | 'habits' | 'smart-work' | 'notebook';

const DATASETS: { id: Dataset; label: string; description: string }[] = [
  { id: 'tasks',      label: 'Tasks',        description: 'All tasks from all boards' },
  { id: 'notes',      label: 'Sticky Notes', description: 'All your sticky notes'     },
  { id: 'habits',     label: 'Habits',       description: 'Habits and completion logs' },
  { id: 'smart-work', label: 'Smart Work',   description: 'Smart work items'           },
  { id: 'notebook',   label: 'Notebook',     description: 'All notebook pages'         },
];

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines   = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => {
      const v = String(row[h] ?? '').replace(/"/g, '""');
      return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v}"` : v;
    }).join(','));
  }
  return lines.join('\n');
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

export default function DataExportPage() {
  const { data: boards = [] } = useBoards();
  const [selected, setSelected] = useState<Set<Dataset>>(new Set(['tasks']));
  const [format,   setFormat]   = useState<Format>('json');
  const [exported, setExported] = useState<string[]>([]);

  const toggle = (id: Dataset) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const fmtDate = (iso: string | undefined | null) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return '—'; }
  };

  const fmtStatus = (s: string) =>
    ({ TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[s] ?? s);

  const fmtPriority = (p: string) =>
    ({ LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' }[p] ?? p);

  const getData = (id: Dataset): Record<string, unknown>[] => {
    switch (id) {
      case 'tasks': {
        return boards.flatMap(b =>
          (b.columns ?? []).flatMap(col =>
            (col.tasks ?? []).map(t => ({
              'Title':       t.title,
              'Status':      fmtStatus(t.status),
              'Priority':    fmtPriority(t.priority),
              'Board':       b.name,
              'Column':      col.name,
              'Assignee':    t.assignee?.name || '—',
              'Due Date':    fmtDate(t.dueDate),
              'Created On':  fmtDate(t.createdAt),
            }))
          )
        );
      }
      case 'notes': {
        const notes = JSON.parse(localStorage.getItem('taskflow_sticky_notes') ?? '[]');
        return notes.map((n: any) => ({
          'Content':    n.content,
          'Color':      n.color,
          'Pinned':     n.pinned ? 'Yes' : 'No',
          'Created On': fmtDate(n.createdAt),
        }));
      }
      case 'habits': {
        const habits = JSON.parse(localStorage.getItem('taskflow_habits') ?? '[]');
        return habits.map((h: any) => {
          const logs: string[] = h.logs ?? [];
          let streak = 0;
          const d = new Date();
          while (true) {
            const k = d.toISOString().slice(0, 10);
            if (logs.includes(k)) { streak++; d.setDate(d.getDate() - 1); } else break;
          }
          const lastLog = logs.length ? fmtDate(logs[logs.length - 1]) : '—';
          return {
            'Habit Name':          h.name,
            'Emoji':               h.emoji ?? '',
            'Total Completions':   logs.length,
            'Current Streak (days)': streak,
            'Last Completed':      lastLog,
            'Created On':          fmtDate(h.createdAt),
          };
        });
      }
      case 'smart-work': {
        const items = JSON.parse(localStorage.getItem('taskflow_smart_work') ?? '[]');
        return items.map((i: any) => ({
          'Title':           i.title,
          'Description':     i.description || '—',
          'Priority':        fmtPriority(i.priority),
          'Status':          fmtStatus(i.status),
          'Estimate (hrs)':  i.estimate,
          'Completed On':    fmtDate(i.completedAt),
        }));
      }
      case 'notebook': {
        const pages = JSON.parse(localStorage.getItem('taskflow_notebook') ?? '[]');
        return pages.map((p: any) => ({
          'Title':        p.title,
          'Word Count':   p.content?.trim().split(/\s+/).filter(Boolean).length ?? 0,
          'Last Updated': fmtDate(p.updatedAt),
          'Created On':   fmtDate(p.createdAt),
        }));
      }
      default: return [];
    }
  };

  const handleExport = () => {
    const names: string[] = [];
    selected.forEach(id => {
      try {
        const data  = getData(id);
        const label = DATASETS.find(d => d.id === id)?.label ?? id;
        const ts    = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        if (format === 'json') {
          download(`taskflow-${id}-${ts}.json`, JSON.stringify(data, null, 2), 'application/json');
        } else {
          download(`taskflow-${id}-${ts}.csv`, toCSV(data), 'text/csv');
        }
        names.push(label);
      } catch {
        console.error(`Export failed for ${id}`);
      }
    });
    setExported(names);
    setTimeout(() => setExported([]), 4000);
  };

  const handlePrintPDF = () => {
    const rows: { dataset: string; items: Record<string, unknown>[] }[] = [];
    selected.forEach(id => {
      const label = DATASETS.find(d => d.id === id)?.label ?? id;
      rows.push({ dataset: label, items: getData(id) });
    });

    if (rows.length === 0) { rows.push({ dataset: 'Tasks', items: getData('tasks') }); }

    const now = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

    const renderTable = (items: Record<string, unknown>[]): string => {
      if (!items.length) return '<p class="empty">No data found.</p>';
      const keys = Object.keys(items[0]);
      return `<table>
        <thead><tr>${keys.map(k => `<th>${k}</th>`).join('')}</tr></thead>
        <tbody>${items.map(row =>
          `<tr>${keys.map(k => `<td>${String(row[k] ?? '–')}</td>`).join('')}</tr>`
        ).join('')}</tbody>
      </table>`;
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>TaskFlow Export — ${now}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body   { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1e293b; background: #fff; padding: 32px; }
    header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 14px; margin-bottom: 28px; }
    header h1  { font-size: 22px; font-weight: 800; color: #6366f1; }
    header p   { color: #64748b; font-size: 11px; margin-top: 3px; }
    header .badge { background: #f1f5f9; color: #475569; font-size: 10px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
    section        { margin-bottom: 36px; }
    section h2     { font-size: 14px; font-weight: 700; color: #334155; padding: 8px 12px; background: #f8fafc; border-left: 4px solid #6366f1; margin-bottom: 12px; border-radius: 0 6px 6px 0; }
    table          { width: 100%; border-collapse: collapse; font-size: 11px; }
    thead tr       { background: #6366f1; color: #fff; }
    thead th       { padding: 8px 10px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    tbody tr       { border-bottom: 1px solid #f1f5f9; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody td       { padding: 7px 10px; color: #334155; max-width: 200px; word-break: break-word; }
    .empty         { color: #94a3b8; font-style: italic; padding: 10px 12px; }
    footer         { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 18px; font-size: 11px; }
      section { page-break-inside: avoid; }
      thead   { display: table-header-group; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>TaskFlow</h1>
      <p>Data Export Report</p>
    </div>
    <div class="badge">Exported ${now}</div>
  </header>
  ${rows.map(({ dataset, items }) => `
  <section>
    <h2>${dataset} <span style="font-weight:400;font-size:11px;color:#94a3b8;">(${items.length} record${items.length !== 1 ? 's' : ''})</span></h2>
    ${renderTable(items)}
  </section>`).join('')}
  <footer>Generated by TaskFlow &nbsp;·&nbsp; ${now}</footer>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Download size={20} /> Data Export
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Export your productivity data in your preferred format.
        </p>
      </div>

      {/* Dataset selection */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select Data to Export</h3>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
          {DATASETS.map(({ id, label, description }) => {
            const isSelected = selected.has(id);
            const count = (() => {
              try {
                if (id === 'tasks') return boards.flatMap(b => (b.columns ?? []).flatMap(c => c.tasks ?? [])).length;
                const key = id === 'notes' ? 'taskflow_sticky_notes' : id === 'habits' ? 'taskflow_habits' : id === 'smart-work' ? 'taskflow_smart_work' : 'taskflow_notebook';
                return JSON.parse(localStorage.getItem(key) ?? '[]').length;
              } catch { return 0; }
            })();

            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={cn(
                  'w-full flex items-center gap-4 px-5 py-4 transition-colors text-left',
                  isSelected ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50',
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected ? 'bg-brand-600 border-brand-600' : 'border-slate-300 dark:border-slate-600',
                )}>
                  {isSelected && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
                  <p className="text-xs text-slate-400">{description} · {count} item{count !== 1 ? 's' : ''}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Format selection */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Export Format</h3>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: 'json' as Format, icon: <FileJson size={20} />, label: 'JSON', desc: 'Full data with nested structure' },
            { id: 'csv'  as Format, icon: <Table2   size={20} />, label: 'CSV',  desc: 'Spreadsheet compatible flat format' },
          ]).map(({ id, icon, label, desc }) => (
            <button
              key={id}
              onClick={() => setFormat(id)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left',
                format === id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500',
              )}
            >
              <span className={format === id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}>{icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={selected.size === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-xl transition-colors"
        >
          <Download size={16} />
          Export {selected.size > 0 ? `${selected.size} dataset${selected.size !== 1 ? 's' : ''}` : 'selected'}
        </button>
        <button
          onClick={handlePrintPDF}
          className="flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
          title="Print / Save as PDF"
        >
          <FileText size={16} /> PDF
        </button>
      </div>

      {exported.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl animate-fade-in">
          <CheckCircle2 size={16} />
          Exported: {exported.join(', ')} as {format.toUpperCase()}
        </div>
      )}
    </div>
  );
}
