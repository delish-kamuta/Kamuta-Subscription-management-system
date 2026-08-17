import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  listOrders,
  getOrdersSummary,
  createOrder,
  updateOrder,
  markOrderPaid,
  deleteOrder,
  type Order,
  type OrderPayload,
  type OrderSummary,
  type OrdersQuery,
} from "~/services/orders";

interface OrdersState {
  items: Order[];
  loaded: boolean;
  loading: boolean;
  summary: OrderSummary | null;
  summaryLoading: boolean;
  error?: string;
}

const initialState: OrdersState = {
  items: [],
  loaded: false,
  loading: false,
  summary: null,
  summaryLoading: false,
  error: undefined,
};

export const fetchOrdersThunk = createAsyncThunk<Order[], OrdersQuery | undefined>(
  "orders/fetch",
  async (query, { rejectWithValue }) => {
    try {
      return await listOrders(query ?? {});
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to load orders");
    }
  },
);

export const fetchOrdersSummaryThunk = createAsyncThunk<OrderSummary, OrdersQuery | undefined>(
  "orders/summary",
  async (query, { rejectWithValue }) => {
    try {
      return await getOrdersSummary(query ?? {});
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to load orders summary");
    }
  },
);

export const createOrderThunk = createAsyncThunk<Order, OrderPayload>(
  "orders/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await createOrder(payload);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to create order");
    }
  },
);

export const updateOrderThunk = createAsyncThunk<
  Order,
  { id: string; payload: Partial<OrderPayload> }
>(
  "orders/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateOrder(id, payload);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to update order");
    }
  },
);

export const markOrderPaidThunk = createAsyncThunk<Order, { id: string; paidDate?: string }>(
  "orders/markPaid",
  async ({ id, paidDate }, { rejectWithValue }) => {
    try {
      return await markOrderPaid(id, paidDate);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to mark order paid");
    }
  },
);

export const deleteOrderThunk = createAsyncThunk<{ id: string }, string>(
  "orders/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteOrder(id);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to delete order");
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrdersError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load orders";
      })
      .addCase(fetchOrdersSummaryThunk.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchOrdersSummaryThunk.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.summaryLoading = false;
      })
      .addCase(fetchOrdersSummaryThunk.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = (action.payload as string) || "Failed to load orders summary";
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateOrderThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(markOrderPaidThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteOrderThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((o) => o.id !== action.payload.id);
      });
  },
});

export const { clearOrdersError } = ordersSlice.actions;
export default ordersSlice.reducer;
