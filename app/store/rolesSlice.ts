import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface RoleItem {
  id?: string
  name: string
}

interface RolesState {
  roles: RoleItem[]
  loaded: boolean
}

const initialState: RolesState = {
  roles: [],
  loaded: false,
}

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setRoles: (state, action: PayloadAction<RoleItem[]>) => {
      state.roles = action.payload
      state.loaded = true
    },
    clearRoles: (state) => {
      state.roles = []
      state.loaded = false
    },
  },
})

export const { setRoles, clearRoles } = rolesSlice.actions
export default rolesSlice.reducer
