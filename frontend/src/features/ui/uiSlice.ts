import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ModalType = 'createTask' | 'editTask' | 'createBoard' | 'createTeam' | 'inviteMember' | null;
export type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  sidebarOpen:  boolean;
  activeModal:  ModalType;
  theme:        ThemeMode;
}

const savedTheme = (localStorage.getItem('theme') as ThemeMode) ?? 'system';

const initialState: UIState = {
  sidebarOpen: true,
  activeModal: null,
  theme:       savedTheme,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    openModal(state, action: PayloadAction<ModalType>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme(state) {
      const next = state.theme === 'light' ? 'dark' : 'light';
      state.theme = next;
      localStorage.setItem('theme', next);
    },
  },
});

export const { toggleSidebar, setSidebarOpen, openModal, closeModal, setTheme, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
