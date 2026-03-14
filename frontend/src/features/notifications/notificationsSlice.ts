import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type NotifCategory = 'task' | 'habit' | 'system' | 'comment' | 'deadline';

export interface AppNotification {
  id:        string;
  title:     string;
  body:      string;
  category:  NotifCategory;
  read:      boolean;
  link?:     string;
  createdAt: string;
}

interface NotifState {
  items: AppNotification[];
}

const STORAGE_KEY = 'taskflow_notifications';

function persist(items: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}

function load(): AppNotification[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

const initialState: NotifState = { items: load() };

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Omit<AppNotification, 'id' | 'read' | 'createdAt'>>) {
      const notif: AppNotification = {
        ...action.payload,
        id:        crypto.randomUUID(),
        read:      false,
        createdAt: new Date().toISOString(),
      };
      state.items.unshift(notif);
      if (state.items.length > 50) state.items = state.items.slice(0, 50);
      persist(state.items);
    },
    markRead(state, action: PayloadAction<string>) {
      const n = state.items.find(i => i.id === action.payload);
      if (n) { n.read = true; persist(state.items); }
    },
    markAllRead(state) {
      state.items.forEach(n => { n.read = true; });
      persist(state.items);
    },
    deleteNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload);
      persist(state.items);
    },
    clearAll(state) {
      state.items = [];
      persist(state.items);
    },
  },
});

export const {
  addNotification, markRead, markAllRead, deleteNotification, clearAll,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
