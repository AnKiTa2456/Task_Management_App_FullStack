import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Board } from '../../types';

interface BoardsState {
  items:       Board[];
  activeBoard: Board | null;
  isLoading:   boolean;
  error:       string | null;
}

const initialState: BoardsState = {
  items:       [],
  activeBoard: null,
  isLoading:   false,
  error:       null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards(state, action: PayloadAction<Board[]>) {
      state.items     = action.payload;
      state.isLoading = false;
    },
    setActiveBoard(state, action: PayloadAction<Board>) {
      state.activeBoard = action.payload;
    },
    addBoard(state, action: PayloadAction<Board>) {
      state.items.unshift(action.payload);
    },
    updateBoard(state, action: PayloadAction<Board>) {
      const idx = state.items.findIndex(b => b.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.activeBoard?.id === action.payload.id) state.activeBoard = action.payload;
    },
    removeBoard(state, action: PayloadAction<string>) {
      state.items = state.items.filter(b => b.id !== action.payload);
      if (state.activeBoard?.id === action.payload) state.activeBoard = null;
    },
    setBoardsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setBoardsError(state, action: PayloadAction<string>) {
      state.error     = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setBoards, setActiveBoard, addBoard, updateBoard, removeBoard,
  setBoardsLoading, setBoardsError,
} = boardsSlice.actions;
export default boardsSlice.reducer;
