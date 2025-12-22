import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "~/store/hooks"
import { fetchUsersThunk, addUserOptimistic, updateUserOptimistic, removeUserOptimistic } from "~/store/usersSlice"
import { apiClient, ensureValidTokenOrMessage } from "~/lib/api"
import { UserRole } from "~/types/auth"

export interface User {
  id: string
  full_name: string
  phone: string
  role: string
  branch_id: string
  created_at: string
  student?: {
    reg_number?: string
  }
}

export interface BranchOption {
  id: string
  name: string
}

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
  const [showNewPwdModal, setShowNewPwdModal] = useState(false)
  const [newPwdValue, setNewPwdValue] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    role: "student",
    branch_id: "",
    password: "",
    reg_number: "",
  })

  const [branchForm, setBranchForm] = useState({
    name: "",
    campus: "University of Rwanda",
    regular_price: 800,
    vip_price: 1200,
    vvip_price: 1800,
  })

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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) {
        setError(tokenError)
        setIsLoading(false)
        return
      }

      const isStudent = formData.role.toLowerCase() === 'student'
      const payload: any = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        password: formData.password,
        reg_number : formData.reg_number,
      }

      if (!formData.branch_id) {
        setError('Please select a branch.')
        setIsLoading(false)
        return
      }
      
      const selected = branches.find(b => String(b.id) === String(formData.branch_id))
      if (!selected) {
        setError('Selected branch is invalid. Please load branches or create one first.')
        setIsLoading(false)
        return
      }
      
      const maybeNum = Number(formData.branch_id)
      payload.branch_id = Number.isNaN(maybeNum) ? formData.branch_id : maybeNum

      if (isStudent && formData.reg_number) {
        payload.reg_number = formData.reg_number.trim()
      }

      if (typeof payload.reg_number === 'string' && payload.reg_number.trim() === '') {
        delete payload.reg_number
      }

      const result = await apiClient<any>('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setSuccessMessage('User added successfully!')
      const created = (result && (result.data || result.user || result)) as Partial<User>
      if (created) {
        dispatch(addUserOptimistic({
          id: String(created.id ?? crypto.randomUUID?.() ?? Date.now()),
          full_name: String(created.full_name ?? formData.full_name),
          phone: String(created.phone ?? formData.phone),
          role: String(created.role ?? formData.role),
          branch_id: String(created.branch_id ?? formData.branch_id),
          created_at: String(created.created_at ?? new Date().toISOString()),
          student: created.student ?? (formData.role.toLowerCase() === 'student' ? { reg_number: formData.reg_number } : undefined),
        }))
      }
      
      setFormData({
        full_name: "",
        phone: "",
        role: "student",
        branch_id: "",
        password: "",
        reg_number: "",
      })
      
      setTimeout(() => {
        setIsAddUserOpen(false)
        setSuccessMessage("")
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to add user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) {
        setError(tokenError)
        setIsLoading(false)
        return
      }

      await apiClient('/branches', {
        method: 'POST',
        body: JSON.stringify({
          name: branchForm.name,
          campus: branchForm.campus,
          regular_price: String(Number(branchForm.regular_price)),
          vip_price: String(Number(branchForm.vip_price)),
          vvip_price: String(Number(branchForm.vvip_price)),
        }),
      })

      setSuccessMessage('Branch added successfully!')

      setBranchForm({
        name: "",
        campus: "University of Rwanda",
        regular_price: 800,
        vip_price: 1200,
        vvip_price: 1800,
      })

      setTimeout(() => {
        setIsAddBranchOpen(false)
        setSuccessMessage("")
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to add branch')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminResetPassword = async (user: User) => {
    try {
      setError("")
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) { setError(tokenError); return }
      
      const data = await apiClient<any>('/users/admin-reset-password', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id }),
      })
      
      const newPwd = data?.data?.new_password
      setSuccessMessage(data?.message || 'Admin password reset successful')
      if (newPwd) {
        setNewPwdValue(String(newPwd))
        setShowNewPwdModal(true)
      }
      setTimeout(() => setSuccessMessage(''), 2500)
    } catch (e: any) {
      setError(e.message || 'Admin reset failed')
    }
  }

  const handleDeleteUser = async (user: User) => {
    try {
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) { setError(tokenError); return }
      
      await apiClient(`/users/${user.id}`, { method: 'DELETE' })
      
      setSuccessMessage('User deleted')
      dispatch(removeUserOptimistic(user.id))
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (e: any) {
      setError(e.message || 'Delete failed')
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      setIsLoading(true)
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) { setError(tokenError); setIsLoading(false); return }
      const body: any = {
        full_name: selectedUser.full_name,
        phone: selectedUser.phone,
        role: selectedUser.role,
        branch_id: selectedUser.branch_id,
      }
      if (selectedUser.role.toLowerCase() === 'student' && selectedUser.student?.reg_number) {
        body.reg_number = selectedUser.student.reg_number
      }
      
      await apiClient(`/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      
      setSuccessMessage('User updated')
      dispatch(updateUserOptimistic({ id: selectedUser.id, ...body, student: selectedUser.student }))
      setIsEditUserOpen(false)
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (err: any) {
      setError(err.message || 'Update failed')
    } finally {
      setIsLoading(false)
    }
  }

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
    staticBranches,
  }
}
