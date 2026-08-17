import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import rolesReducer from './rolesSlice';
import usersReducer from './usersSlice';
import branchesReducer from './branchesSlice';
import subscriptionsReducer from './subscriptionsSlice';
import allSubscriptionsReducer from './allSubscriptionsSlice';
import mealLogsReducer from './mealLogsSlice';
import paymentsReducer from './paymentsSlice';
import storeReducer from './storeSlice';
import shopReducer from './shopSlice';
import buffetReducer from './buffetSlice';
import payrollReducer from './payrollSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: rolesReducer,
    users: usersReducer,
    branches: branchesReducer,
    subscriptions: subscriptionsReducer,
    allSubscriptions: allSubscriptionsReducer,
    mealLogs: mealLogsReducer,
    payments: paymentsReducer,
    store: storeReducer,
    shop: shopReducer,
    buffet: buffetReducer,
    payroll: payrollReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
