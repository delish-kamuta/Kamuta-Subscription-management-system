import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCurrentBuffetShifts,
  startBuffetShift,
  addBuffetEntry,
  closeBuffetShift,
  type BuffetShift,
  type StartShiftPayload,
  type EntryPayload,
  type CloseShiftPayload,
} from "~/services/buffet";

interface BuffetState {
  // A scanner may have multiple open shifts at once — one per meal_type tier.
  // We also keep the most recent CLOSED shift per tier so the UI shows the summary.
  currentShifts: BuffetShift[];
  loading: boolean;
  error?: string;
  lastFetched?: number;
}

const initialState: BuffetState = {
  currentShifts: [],
  loading: false,
  error: undefined,
  lastFetched: undefined,
};

export const fetchCurrentBuffetShiftsThunk = createAsyncThunk<
  BuffetShift[],
  { scannerId?: string }
>(
  "buffet/fetchCurrent",
  async ({ scannerId }, { rejectWithValue }) => {
    try {
      return await getCurrentBuffetShifts(scannerId);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Unable to fetch buffet shifts");
    }
  }
);

export const startBuffetShiftThunk = createAsyncThunk<
  BuffetShift,
  { scanner: { id?: string; name?: string }; payload: StartShiftPayload }
>(
  "buffet/startShift",
  async ({ scanner, payload }, { rejectWithValue }) => {
    try {
      return await startBuffetShift(scanner, payload);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to start shift");
    }
  }
);

export const addBuffetEntryThunk = createAsyncThunk<
  BuffetShift,
  { shiftId: string; payload: EntryPayload }
>(
  "buffet/addEntry",
  async ({ shiftId, payload }, { rejectWithValue }) => {
    try {
      return await addBuffetEntry(shiftId, payload);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to log entry");
    }
  }
);

export const closeBuffetShiftThunk = createAsyncThunk<
  BuffetShift,
  { shiftId: string; payload: CloseShiftPayload }
>(
  "buffet/closeShift",
  async ({ shiftId, payload }, { rejectWithValue }) => {
    try {
      return await closeBuffetShift(shiftId, payload);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to close shift");
    }
  }
);

const upsertShift = (shifts: BuffetShift[], incoming: BuffetShift): BuffetShift[] => {
  const idx = shifts.findIndex((s) => s.id === incoming.id);
  if (idx >= 0) {
    const next = shifts.slice();
    next[idx] = incoming;
    return next;
  }
  return [...shifts, incoming];
};

const buffetSlice = createSlice({
  name: "buffet",
  initialState,
  reducers: {
    clearBuffetError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentBuffetShiftsThunk.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchCurrentBuffetShiftsThunk.fulfilled, (state, action) => {
        state.currentShifts = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCurrentBuffetShiftsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch buffet shifts";
      })
      .addCase(startBuffetShiftThunk.fulfilled, (state, action) => {
        state.currentShifts = upsertShift(state.currentShifts, action.payload);
      })
      .addCase(startBuffetShiftThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to start shift";
      })
      .addCase(addBuffetEntryThunk.fulfilled, (state, action) => {
        state.currentShifts = upsertShift(state.currentShifts, action.payload);
      })
      .addCase(addBuffetEntryThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to log entry";
      })
      .addCase(closeBuffetShiftThunk.fulfilled, (state, action) => {
        state.currentShifts = upsertShift(state.currentShifts, action.payload);
      })
      .addCase(closeBuffetShiftThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to close shift";
      });
  },
});

export const { clearBuffetError } = buffetSlice.actions;
export default buffetSlice.reducer;
