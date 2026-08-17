import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { listMealLogs, type MealLogItem, type MealLogsQuery } from "~/services/mealLogs";

interface MealLogsState {
  items: MealLogItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loaded: boolean;
  loading: boolean;
  error?: string;
  lastFetched?: number;
}

const initialState: MealLogsState = {
  items: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  loaded: false,
  loading: false,
  error: undefined,
  lastFetched: undefined,
};

// Safety cap: never fire more than this many pages in parallel.
// Covers a few thousand rows while preventing ERR_INSUFFICIENT_RESOURCES
// on very large result sets (the API ignores per_page and returns 10/page).
const MAX_PAGES = 50;

export const fetchMealLogsThunk = createAsyncThunk(
  "mealLogs/fetch",
  async (query: MealLogsQuery, { rejectWithValue }) => {
    try {
      const firstRes = await listMealLogs({ ...query, page: 1 });
      if (!firstRes.success) return rejectWithValue(firstRes.message || "Failed to fetch meal logs");

      let items: MealLogItem[] = firstRes.data ?? [];
      const totalItems = firstRes.pagination?.total_items ?? 0;
      const totalPagesReported = firstRes.pagination?.total_pages ?? 1;
      const totalPages = Math.min(totalPagesReported, MAX_PAGES);

      if (totalPages > 1) {
        const pagePromises = [];
        for (let p = 2; p <= totalPages; p++) {
          pagePromises.push(listMealLogs({ ...query, page: p }));
        }
        const results = await Promise.allSettled(pagePromises);
        for (const result of results) {
          if (result.status === "fulfilled" && result.value.success) {
            items = [...items, ...(result.value.data ?? [])];
          }
        }
      }

      return {
        items,
        totalItems,
        totalPages: totalPagesReported,
        currentPage: firstRes.pagination?.current_page ?? 1,
      };
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
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
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
