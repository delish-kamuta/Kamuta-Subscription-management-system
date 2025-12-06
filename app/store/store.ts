import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import rolesReducer from './rolesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: rolesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
