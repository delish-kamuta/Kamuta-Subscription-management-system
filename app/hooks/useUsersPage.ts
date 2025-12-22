import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "~/store/hooks"
import { fetchUsersThunk } from "~/store/usersSlice"
import { apiClient, ensureValidTokenOrMessage } from "~/lib/api"
import { type Student } from "~/types/auth"
import type { User, BranchOption } from "~/types/users"
import { useUserForm } from "./useUserForm"
import { useBranchForm } from "./useBranchForm"
import { useUserActions } from "./useUserActions"

export function useUsersPage() {
  const dispatch = useAppDispatch()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const roleState = useAppSelector((state) => state.roles)
  const usersState = useAppSelector((state) => state.users)
  const users = usersState.items as User[]
  const usersLoading = usersState.loading

  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false)
  const [isViewUserOpen, setIsViewUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [branches, setBranches] = useState<BranchOption[]>([])

  // Initialize sub-hooks
  const { formData, setFormData, handleAddUser } = useUserForm(
    branches,
    setSuccessMessage,
    setError,
    setIsLoading,
    setIsAddUserOpen
  )

  const { branchForm, setBranchForm, handleAddBranch } = useBranchForm(
    setSuccessMessage,
    setError,
    setIsLoading,
    setIsAddBranchOpen
  )

  const {
    showNewPwdModal,
    setShowNewPwdModal,
    newPwdValue,
    handleAdminResetPassword,
    handleDeleteUser,
    handleUpdateUser
  } = useUserActions(
    selectedUser,
    setSuccessMessage,
    setError,
    setIsLoading,
    setIsEditUserOpen
  )

  useEffect(() => {
    if (!usersState.loaded) {
      dispatch(fetchUsersThunk())
    }
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) return
      const result = await apiClient<any>('/branches')
      const options: BranchOption[] = (result.data || []).map((b: any) => ({ id: b.id || b.name, name: b.name }))
      setBranches(options)
    } catch {}
  }

  const ensureBranchPresent = async (branchId: string) => {
    if (!branchId) return
    const exists = branches.some(b => String(b.id) === String(branchId))
    if (exists) return
    try {
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) return
      const data = await apiClient<any>(`/branches/${branchId}`)
      const name = data?.data?.name || data?.name || String(branchId)
      setBranches(prev => [{ id: branchId, name }, ...prev])
    } catch {}
  }

  // Static branch options while backend GET is unauthorized
  const staticBranches: BranchOption[] = [
    { id: 'BUSOGO', name: 'BUSOGO' },
    { id: 'NYAGATARE', name: 'NYAGATARE' },
    { id: 'KIGALI', name: 'KIGALI' },
  ]

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return {
    currentUser,
    roleState,
    usersLoading,
    isAddUserOpen, setIsAddUserOpen,
    isAddBranchOpen, setIsAddBranchOpen,
    isViewUserOpen, setIsViewUserOpen,
    isEditUserOpen, setIsEditUserOpen,
    selectedUser, setSelectedUser,
    isLoading,
    searchQuery, setSearchQuery,
    error, setError,
    successMessage, setSuccessMessage,
    branches,
    showNewPwdModal, setShowNewPwdModal,
    newPwdValue,
    formData, setFormData,
    branchForm, setBranchForm,
    fetchBranches,
    ensureBranchPresent,
    handleAddUser,
    handleAddBranch,
    handleAdminResetPassword,
    handleDeleteUser,
    handleUpdateUser,
    filteredUsers,
    staticBranches
  }
}
