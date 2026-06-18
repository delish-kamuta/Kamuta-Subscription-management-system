import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { listStudentSubscriptions, updateStudentSubscription, updateStudent, cancelStudentSubscription } from '~/services/subscriptions';
import type { SubscriptionItem } from '~/hooks/useSubscriptionFilters';

interface SubscriptionsState {
  items: SubscriptionItem[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

const initialState: SubscriptionsState = {
  items: [],
  loading: false,
  error: null,
  hydrated: false,
};

export const fetchSubscriptions = createAsyncThunk<SubscriptionItem[], { token: string | null }>(
  'subscriptions/fetch',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await listStudentSubscriptions(token);
      return response;
    } catch (e: any) {
      return rejectWithValue(e.message || String(e));
    }
  }
);

export const updateSubscription = createAsyncThunk<any, { token: string | null, id: string, payload: any }>(
  'subscriptions/update',
  async ({ token, id, payload }, { rejectWithValue }) => {
    try {
      const response = await updateStudentSubscription(token, id, payload);
      return response.data || response;
    } catch (e: any) {
      return rejectWithValue(e.message || String(e));
    }
  }
);

export const updateStudentDetails = createAsyncThunk<any, { token: string | null, id: string, payload: any }>(
  'subscriptions/updateStudent',
  async ({ token, id, payload }, { rejectWithValue }) => {
    try {
      const response = await updateStudent(token, id, payload);
      return response.data || response;
    } catch (e: any) {
      return rejectWithValue(e.message || String(e));
    }
  }
);

export const cancelSubscription = createAsyncThunk<any, { token: string | null, id: string }>(
  'subscriptions/cancel',
  async ({ token, id }, { rejectWithValue }) => {
    try {
      const response = await cancelStudentSubscription(token, id);
      return { id, ...response };
    } catch (e: any) {
      return rejectWithValue(e.message || String(e));
    }
  }
);

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<SubscriptionItem[]>) => {
      state.items = action.payload;
      state.hydrated = true;
    },
    upsertSubscription: (state, action: PayloadAction<SubscriptionItem>) => {
      const idx = state.items.findIndex((s) => 
        (s.subscriptionId && action.payload.subscriptionId && s.subscriptionId === action.payload.subscriptionId) ||
        s.id === action.payload.id
      );
      if (idx >= 0) state.items[idx] = action.payload; else state.items.unshift(action.payload);
    },
    clearSubscriptions: (state) => {
      state.items = [];
      state.hydrated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; state.hydrated = true; })
      .addCase(fetchSubscriptions.rejected, (state, action: any) => { state.loading = false; state.error = action.payload || 'Failed to fetch subscriptions'; })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const updatedData = action.payload;
        const subId = action.meta.arg.id;
        const idx = state.items.findIndex((s) => s.subscriptionId === subId);
        if (idx >= 0) {
          const item = state.items[idx];
          item.totalMeals = Number(updatedData.total_meals ?? item.totalMeals);
          item.mealsLeft = Number(updatedData.remaining_meals ?? item.mealsLeft);
          if (updatedData.meal_type) {
             item.subscriptionType = updatedData.meal_type;
          }
          if (updatedData.payment_history && updatedData.payment_history.length > 0) {
             item.payment = updatedData.payment_history[0].payment_method;
          }
          state.items[idx] = item;
        }
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        const subId = action.meta.arg.id;
        // Remove the cancelled subscription from the list
        state.items = state.items.filter((s) => s.subscriptionId !== subId);
      });
  }
});

export const { setSubscriptions, upsertSubscription, clearSubscriptions } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;