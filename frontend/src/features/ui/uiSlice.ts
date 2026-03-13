import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ModalType = 'createTask' | 'editTask' | 'createBoard' | 'createTeam' | 'inviteMember' | null;

interface UIState {
  sidebarOpen:  boolean;
  activeModal:  ModalType;
  theme:        'light' | 'dark';
}

const initialState: UIState = {
  sidebarOpen: true,
  activeModal: null,
  theme:       'light',
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
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleSidebar, setSidebarOpen, openModal, closeModal, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
