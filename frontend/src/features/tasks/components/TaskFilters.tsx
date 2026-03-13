import { Search, X } from 'lucide-react';
import { Select }    from '../../../components/ui/Select';
import Button        from '../../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setFilters, clearFilters }       from '../tasksSlice';
import { useDebounce }  from '../../../hooks/useDebounce';
import { useEffect, useState } from 'react';
import type { TaskStatus, Priority } from '../../../types';

const STATUS_OPTIONS = [
  { value: '',            label: 'All statuses'  },
  { value: 'TODO',        label: 'To Do'         },
  { value: 'IN_PROGRESS', label: 'In Progress'   },
  { value: 'IN_REVIEW',   label: 'In Review'     },
  { value: 'DONE',        label: 'Done'          },
];

const PRIORITY_OPTIONS = [
  { value: '',       label: 'All priorities' },
  { value: 'LOW',    label: 'Low'            },
  { value: 'MEDIUM', label: 'Medium'         },
  { value: 'HIGH',   label: 'High'           },
  { value: 'URGENT', label: 'Urgent'         },
];

export function TaskFilters() {
  const dispatch = useAppDispatch();
  const filters  = useAppSelector(s => s.tasks.filters);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    dispatch(setFilters({ search: debouncedSearch }));
  }, [debouncedSearch, dispatch]);

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
          placeholder="Search tasks…"
          className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white
                     focus:outline-none focus:ring-2 focus:ring-brand-400 w-44 placeholder:text-slate-400"
        />
      </div>
      <Select
        options={STATUS_OPTIONS} value={filters.status ?? ''}
        onChange={e => dispatch(setFilters({ status: (e.target.value as TaskStatus) || null }))}
        className="py-1.5 text-sm w-36"
      />
      <Select
        options={PRIORITY_OPTIONS} value={filters.priority ?? ''}
        onChange={e => dispatch(setFilters({ priority: (e.target.value as Priority) || null }))}
        className="py-1.5 text-sm w-36"
      />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => { dispatch(clearFilters()); setSearchInput(''); }} className="gap-1">
          <X size={13} /> Clear
        </Button>
      )}
    </div>
  );
}
