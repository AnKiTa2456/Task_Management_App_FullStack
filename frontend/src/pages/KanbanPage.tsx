import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus, LayoutGrid, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

import KanbanColumn    from '../components/kanban/KanbanColumn';
import TaskCard        from '../components/kanban/TaskCard';
import TaskDetailPanel from '../components/kanban/TaskDetailPanel';
import Button          from '../components/ui/Button';
import Modal           from '../components/ui/Modal';
import Input           from '../components/ui/Input';
import { TaskFilters } from '../features/tasks/components/TaskFilters';
import { TaskForm }    from '../features/tasks/components/TaskForm';
import { BoardCard }         from '../features/boards/components/BoardCard';
import { CreateBoardModal }  from '../features/boards/components/CreateBoardModal';
import { useBoards, useBoard } from '../features/boards';
import { useCreateTask, useMoveTask } from '../features/tasks/hooks/useTasks';
import { boardsApi } from '../services/api';
import { QUERY_KEYS } from '../utils/constants';
import { useAppSelector } from '../app/hooks';
import type { Column, Task } from '../types';
import type { CreateTaskDto } from '../services/api/tasks.api';

// ─── Boards list view (/boards) ──────────────────────────────────────────────

function BoardsView() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: boards = [], isLoading, isError } = useBoards();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Boards</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {boards.length} board{boards.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          New Board
        </Button>
      </div>

      {isError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 border border-red-100">
          <AlertCircle size={16} /> Failed to load boards. Please try again.
        </div>
      )}

      {!isError && boards.length === 0 && (
        <div className="flex flex-col items-center justify-center h-52 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <LayoutGrid size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No boards yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create your first board to get started</p>
          <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>
            Create board
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {boards.map(b => <BoardCard key={b.id} board={b} />)}
      </div>

      <CreateBoardModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

// ─── Kanban board view (/board/:boardId) ─────────────────────────────────────

function KanbanView({ boardId }: { boardId: string }) {
  const [columns, setColumns]         = useState<Column[]>([]);
  const [activeTask, setActiveTask]   = useState<Task | null>(null);
  const [addTaskColId, setAddTaskColId] = useState<string | null>(null);
  const [addColOpen, setAddColOpen]   = useState(false);
  const [newColName, setNewColName]   = useState('');
  const [addingCol, setAddingCol]     = useState(false);

  // Keep a ref to always access the latest columns in drag handlers
  const columnsRef = useRef<Column[]>([]);
  useEffect(() => { columnsRef.current = columns; }, [columns]);

  const selectedTask = useAppSelector(s => s.tasks.selected);
  const { data: board, isLoading, isError } = useBoard(boardId);
  const { mutate: createTask, isPending: isCreatingTask } = useCreateTask(boardId);
  const { mutate: moveTask } = useMoveTask(boardId);
  const qc = useQueryClient();

  // Sync local columns state whenever board data arrives or refreshes
  useEffect(() => {
    if (board?.columns) {
      setColumns([...board.columns].sort((a, b) => a.position - b.position));
    }
  }, [board]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findColumn = (id: string) =>
    columnsRef.current.find(c => c.id === id || c.tasks.some(t => t.id === id));

  const handleDragStart = ({ active }: DragStartEvent) => {
    const task = findColumn(active.id as string)?.tasks.find(t => t.id === active.id);
    setActiveTask(task ?? null);
  };

  // While dragging over a different column, move the task there optimistically
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const fromCol = findColumn(active.id as string);
    const toCol   = columnsRef.current.find(c => c.id === over.id) ?? findColumn(over.id as string);
    if (!fromCol || !toCol || fromCol.id === toCol.id) return;
    setColumns(prev => {
      const task = fromCol.tasks.find(t => t.id === active.id)!;
      return prev.map(c => {
        if (c.id === fromCol.id) return { ...c, tasks: c.tasks.filter(t => t.id !== active.id) };
        if (c.id === toCol.id)   return { ...c, tasks: [...c.tasks, { ...task, columnId: toCol.id }] };
        return c;
      });
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);

    // Drop cancelled — revert to server state
    if (!over) {
      if (board?.columns) setColumns([...board.columns].sort((a, b) => a.position - b.position));
      return;
    }

    const activeId = active.id as string;
    const overId   = over.id as string;
    const current  = columnsRef.current;

    // Compute updated columns + derive API call params in one pass
    let targetColId: string | undefined;
    let newPosition = 0;

    const newCols = current.map(col => {
      const oldIdx = col.tasks.findIndex(t => t.id === activeId);
      const newIdx = col.tasks.findIndex(t => t.id === overId);
      // Same-column reorder: both task ids found in this column
      if (oldIdx !== -1 && newIdx !== -1) {
        targetColId = col.id;
        newPosition = newIdx;
        return { ...col, tasks: arrayMove(col.tasks, oldIdx, newIdx) };
      }
      return col;
    });

    // Cross-column drop: task was already moved by handleDragOver, just find it
    if (!targetColId) {
      const taskCol = newCols.find(c => c.tasks.some(t => t.id === activeId));
      if (taskCol) {
        targetColId = taskCol.id;
        newPosition = taskCol.tasks.findIndex(t => t.id === activeId);
      }
    }

    setColumns(newCols);

    if (targetColId) {
      moveTask(
        { taskId: activeId, dto: { columnId: targetColId, position: newPosition } },
        {
          onError: () => {
            if (board?.columns) setColumns([...board.columns].sort((a, b) => a.position - b.position));
          },
        },
      );
    }
  };

  const handleAddTask = (data: CreateTaskDto) => {
    createTask(data, { onSuccess: () => setAddTaskColId(null) });
  };

  const handleAddColumn = async () => {
    if (!newColName.trim()) return;
    setAddingCol(true);
    try {
      await boardsApi.addColumn(boardId, { name: newColName.trim() });
      await qc.invalidateQueries({ queryKey: QUERY_KEYS.board(boardId) });
      setNewColName('');
      setAddColOpen(false);
      toast.success('Column added');
    } catch {
      toast.error('Failed to add column');
    } finally {
      setAddingCol(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (isError || !board) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 border border-red-100">
        <AlertCircle size={16} /> Board not found or failed to load.
      </div>
    );
  }

  const totalTasks = columns.reduce((s, c) => s + c.tasks.length, 0);

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{board.name}</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {totalTasks} task{totalTasks !== 1 ? 's' : ''} · {columns.length} column{columns.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TaskFilters />
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setAddTaskColId(columns[0]?.id ?? null)}
            disabled={columns.length === 0}
          >
            <Plus size={14} /> Add Task
          </Button>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {columns.map(col => (
            <KanbanColumn key={col.id} column={col} onAddTask={() => setAddTaskColId(col.id)} />
          ))}
          <button
            onClick={() => setAddColOpen(true)}
            className="flex-shrink-0 w-72 h-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl
                       flex items-center justify-center gap-2 text-sm text-slate-400 dark:text-slate-500
                       hover:border-brand-400 hover:text-brand-500 transition-colors self-start"
          >
            <Plus size={16} /> Add column
          </button>
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedTask && <TaskDetailPanel />}

      {/* Add task modal */}
      <Modal open={!!addTaskColId} onClose={() => setAddTaskColId(null)} title="Add new task">
        {addTaskColId && (
          <TaskForm
            columnId={addTaskColId}
            onSubmit={handleAddTask}
            onCancel={() => setAddTaskColId(null)}
            isLoading={isCreatingTask}
          />
        )}
      </Modal>

      {/* Add column modal */}
      <Modal
        open={addColOpen}
        onClose={() => { setAddColOpen(false); setNewColName(''); }}
        title="Add column"
      >
        <div className="space-y-4">
          <Input
            label="Column name"
            placeholder="e.g. In Review, Blocked, QA"
            value={newColName}
            onChange={e => setNewColName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setAddColOpen(false); setNewColName(''); }}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn} loading={addingCol} disabled={!newColName.trim()}>
              Add column
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default function KanbanPage() {
  const { boardId } = useParams<{ boardId: string }>();
  return boardId ? <KanbanView boardId={boardId} /> : <BoardsView />;
}
