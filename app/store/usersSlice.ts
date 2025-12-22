import { createSlice, createAsyncThunk,type PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '~/lib/api'

export interface StudentInfo { reg_number?: string }
export interface UserItem {
  id: string
  full_name: string
  phone: string
  role: string
  branch_id: string
  created_at: string
  student?: StudentInfo
}

interface UsersState {
  items: UserItem[]
  loaded: boolean
  loading: boolean
  error?: string
  lastFetched?: number
}

const initialState: UsersState = {
  items: [],
  loaded: false,
  loading: false,
}

export const fetchUsersThunk = createAsyncThunk('users/fetch', async (_, { rejectWithValue }) => {
  try {
    const data = await apiClient<any>('/users');
    return (data?.data ?? []) as UserItem[];
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch users');
  }
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUserOptimistic(state, action: PayloadAction<UserItem>) {
      state.items = [action.payload, ...state.items]
    },
    removeUserOptimistic(state, action: PayloadAction<string>) {
      state.items = state.items.filter(u => u.id !== action.payload)
    },
    updateUserOptimistic(state, action: PayloadAction<Partial<UserItem> & { id: string }>) {
      state.items = state.items.map(u => (u.id === action.payload.id ? { ...u, ...action.payload } : u))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.items = action.payload
        state.loaded = true
        state.loading = false
        state.lastFetched = Date.now()
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message
      })
  },
})

export const { addUserOptimistic, removeUserOptimistic, updateUserOptimistic } = usersSlice.actions
export default usersSlice.reducer
