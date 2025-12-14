import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import rolesReducer from './rolesSlice';
import usersReducer from './usersSlice';
import branchesReducer from './branchesSlice';
import subscriptionsReducer from './subscriptionsSlice';
import mealLogsReducer from './mealLogsSlice';
import paymentsReducer from './paymentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: rolesReducer,
    users: usersReducer,
    branches: branchesReducer,
    subscriptions: subscriptionsReducer,
    mealLogs: mealLogsReducer,
    payments: paymentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
