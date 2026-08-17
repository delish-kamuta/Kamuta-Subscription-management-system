import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  listWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
  recordAdvance,
  recordDeduction,
  getPayrollSummary,
  type PayrollWorker,
  type WorkerPayload,
  type AdvancePayload,
  type DeductionPayload,
  type PayrollSummary,
} from "~/services/payroll";

interface PayrollState {
  workers: PayrollWorker[];
  workersLoaded: boolean;
  workersLoading: boolean;
  summary: PayrollSummary | null;
  summaryLoading: boolean;
  error?: string;
}

const initialState: PayrollState = {
  workers: [],
  workersLoaded: false,
  workersLoading: false,
  summary: null,
  summaryLoading: false,
  error: undefined,
};

export const fetchWorkersThunk = createAsyncThunk<PayrollWorker[], { branchId?: string } | undefined>(
  "payroll/fetchWorkers",
  async (arg, { rejectWithValue }) => {
    try {
      return await listWorkers(arg?.branchId);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to load workers");
    }
  },
);

export const createWorkerThunk = createAsyncThunk<PayrollWorker, WorkerPayload>(
  "payroll/createWorker",
  async (payload, { rejectWithValue }) => {
    try {
      return await createWorker(payload);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to add worker");
    }
  },
);

export const updateWorkerThunk = createAsyncThunk<
  PayrollWorker,
  { id: string; payload: Partial<WorkerPayload> }
>(
  "payroll/updateWorker",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateWorker(id, payload);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to update worker");
    }
  },
);

export const deleteWorkerThunk = createAsyncThunk<{ id: string }, string>(
  "payroll/deleteWorker",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteWorker(id);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to delete worker");
    }
  },
);

export const recordAdvanceThunk = createAsyncThunk<
  { id: string },
  { workerId: string; payload: AdvancePayload }
>(
  "payroll/recordAdvance",
  async ({ workerId, payload }, { rejectWithValue }) => {
    try {
      const res = await recordAdvance(workerId, payload);
      return { id: res.id };
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to record advance");
    }
  },
);

export const recordDeductionThunk = createAsyncThunk<
  { id: string },
  { workerId: string; payload: DeductionPayload }
>(
  "payroll/recordDeduction",
  async ({ workerId, payload }, { rejectWithValue }) => {
    try {
      const res = await recordDeduction(workerId, payload);
      return { id: res.id };
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to apply deduction");
    }
  },
);

export const fetchPayrollSummaryThunk = createAsyncThunk<
  PayrollSummary,
  { period: string; branchId?: string }
>(
  "payroll/summary",
  async ({ period, branchId }, { rejectWithValue }) => {
    try {
      return await getPayrollSummary(period, branchId);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to load payroll summary");
    }
  },
);

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    clearPayrollError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkersThunk.pending, (state) => {
        state.workersLoading = true;
        state.error = undefined;
      })
      .addCase(fetchWorkersThunk.fulfilled, (state, action) => {
        state.workers = action.payload;
        state.workersLoading = false;
        state.workersLoaded = true;
      })
      .addCase(fetchWorkersThunk.rejected, (state, action) => {
        state.workersLoading = false;
        state.error = (action.payload as string) || "Failed to load workers";
      })
      .addCase(createWorkerThunk.fulfilled, (state, action) => {
        state.workers.unshift(action.payload);
      })
      .addCase(updateWorkerThunk.fulfilled, (state, action) => {
        const idx = state.workers.findIndex((w) => w.id === action.payload.id);
        if (idx >= 0) state.workers[idx] = action.payload;
      })
      .addCase(deleteWorkerThunk.fulfilled, (state, action) => {
        state.workers = state.workers.filter((w) => w.id !== action.payload.id);
      })
      .addCase(fetchPayrollSummaryThunk.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchPayrollSummaryThunk.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.summaryLoading = false;
      })
      .addCase(fetchPayrollSummaryThunk.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = (action.payload as string) || "Failed to load payroll summary";
      });
  },
});

export const { clearPayrollError } = payrollSlice.actions;
export default payrollSlice.reducer;
