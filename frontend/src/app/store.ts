import { configureStore } from '@reduxjs/toolkit';
import authReducer    from '../features/auth/authSlice';
import boardsReducer  from '../features/boards/boardsSlice';
import tasksReducer   from '../features/tasks/tasksSlice';
import teamsReducer   from '../features/teams/teamsSlice';
import uiReducer      from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth:   authReducer,
    boards: boardsReducer,
    tasks:  tasksReducer,
    teams:  teamsReducer,
    ui:     uiReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
