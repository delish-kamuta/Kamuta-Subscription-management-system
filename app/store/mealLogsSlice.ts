import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { listMealLogs, type MealLogItem, type MealLogsQuery } from "~/services/mealLogs";

interface MealLogsState {
  items: MealLogItem[];
  loaded: boolean;
  loading: boolean;
  error?: string;
  lastFetched?: number;
}

const initialState: MealLogsState = {
  items: [],
  loaded: false,
  loading: false,
  error: undefined,
  lastFetched: undefined,
};

export const fetchMealLogsThunk = createAsyncThunk(
  "mealLogs/fetch",
  async (query: MealLogsQuery, { rejectWithValue }) => {
    try {
      const res = await listMealLogs(query);
      if (!res.success) {
        return rejectWithValue(res.message || "Failed to fetch meal logs");
      }
      return res.data || [];
    } catch (e: any) {
      return rejectWithValue(e?.message || "Unable to fetch meal logs");
    }
  }
);

const mealLogsSlice = createSlice({
  name: "mealLogs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMealLogsThunk.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchMealLogsThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.loaded = true;
        state.lastFetched = Date.now();
      })
      .addCase(fetchMealLogsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch meal logs";
      });
  },
});

export default mealLogsSlice.reducer;
