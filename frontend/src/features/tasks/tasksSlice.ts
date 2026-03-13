import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskStatus, Priority } from '../../types';

interface TaskFilters {
  status:     TaskStatus | null;
  priority:   Priority   | null;
  assigneeId: string     | null;
  search:     string;
}

interface TasksState {
  byColumn:   Record<string, Task[]>;
  selected:   Task | null;
  filters:    TaskFilters;
  isLoading:  boolean;
  error:      string | null;
}

const initialState: TasksState = {
  byColumn:  {},
  selected:  null,
  filters:   { status: null, priority: null, assigneeId: null, search: '' },
  isLoading: false,
  error:     null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setColumnTasks(state, action: PayloadAction<{ columnId: string; tasks: Task[] }>) {
      state.byColumn[action.payload.columnId] = action.payload.tasks;
    },
    addTask(state, action: PayloadAction<Task>) {
      const col = state.byColumn[action.payload.columnId] ?? [];
      state.byColumn[action.payload.columnId] = [...col, action.payload];
    },
    updateTask(state, action: PayloadAction<Task>) {
      const col = state.byColumn[action.payload.columnId];
      if (col) {
        const idx = col.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) col[idx] = action.payload;
      }
      if (state.selected?.id === action.payload.id) state.selected = action.payload;
    },
    removeTask(state, action: PayloadAction<{ taskId: string; columnId: string }>) {
      const col = state.byColumn[action.payload.columnId];
      if (col) {
        state.byColumn[action.payload.columnId] =
          col.filter(t => t.id !== action.payload.taskId);
      }
    },
    moveTask(
      state,
      action: PayloadAction<{
        taskId:         string;
        fromColumnId:   string;
        toColumnId:     string;
        newPosition:    number;
      }>,
    ) {
      const { taskId, fromColumnId, toColumnId, newPosition } = action.payload;
      const from = state.byColumn[fromColumnId] ?? [];
      const taskIdx = from.findIndex(t => t.id === taskId);
      if (taskIdx === -1) return;
      const [task] = from.splice(taskIdx, 1);
      task.columnId = toColumnId;
      task.position = newPosition;
      const to = state.byColumn[toColumnId] ?? [];
      to.splice(newPosition, 0, task);
      state.byColumn[toColumnId] = to;
    },
    setSelectedTask(state, action: PayloadAction<Task | null>) {
      state.selected = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = { status: null, priority: null, assigneeId: null, search: '' };
    },
    setTasksLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setColumnTasks, addTask, updateTask, removeTask, moveTask,
  setSelectedTask, setFilters, clearFilters, setTasksLoading,
} = tasksSlice.actions;
export default tasksSlice.reducer;
