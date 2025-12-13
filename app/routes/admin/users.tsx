import { Header } from "../../../components/Header"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useState, useEffect } from "react"
import { authFetch, ensureValidTokenOrMessage } from "~/lib/api"
import { ActionsBar } from "../../components/components/ActionsBar"
import { UsersTable } from "../../components/components/UsersTable"
import { AddUserSheet } from "../../components/components/AddUserSheet"
import { AddBranchSheet } from "../../components/components/AddBranchSheet"
import { useAppSelector, useAppDispatch } from "~/store/hooks"
import { fetchUsersThunk, addUserOptimistic, updateUserOptimistic, removeUserOptimistic } from "~/store/usersSlice"
import { UserRole } from "~/types/auth"

interface User {
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

interface student {
  reg_number:string;
}

interface BranchOption {
  id: string
  name: string
}

export default function UsersPage() {
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
    // Prefetch users and branches on mount to reduce UI latency, only if not loaded
    if (!usersState.loaded) {
      dispatch(fetchUsersThunk())
    }
    fetchBranches()
  }, [])

  // fetchUsers replaced by redux thunk


  const fetchBranches = async () => {
    try {
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) {
        return
      }
      const response = await authFetch('https://restaurant-bn-api.onrender.com/api/branches')
      if (response.ok) {
        const result = await response.json()
        // Expecting result.data to be an array of branches with id and name
        const options: BranchOption[] = (result.data || []).map((b: any) => ({ id: b.id || b.name, name: b.name }))
        setBranches(options)
      }
    } catch {}
  }

  
    // Ensure a specific branch id is present in the options by fetching it directly if necessary
    const ensureBranchPresent = async (branchId: string) => {
      if (!branchId) return
      const exists = branches.some(b => String(b.id) === String(branchId))
      if (exists) return
      try {
        const tokenError = ensureValidTokenOrMessage()
        if (tokenError) return
        const resp = await authFetch(`https://restaurant-bn-api.onrender.com/api/branches/${branchId}`)
        if (resp.ok) {
          const data = await resp.json()
          const name = data?.data?.name || data?.name || String(branchId)
          setBranches(prev => [{ id: branchId, name }, ...prev])
        }
      } catch {}
    }

  // Roles are seeded in Redux (no endpoint yet)

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

      // Build payload: branch is required for all roles including students
      const isStudent = formData.role.toLowerCase() === 'student'
      const payload: any = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        password: formData.password,
        reg_number : formData.reg_number,
      }

      console.log(payload)
      // Branch is mandatory
      if (!formData.branch_id) {
        setError('Please select a branch.')
        setIsLoading(false)
        return
      }
      // Validate that selected branch exists in loaded branches to avoid invalid IDs
      const selected = branches.find(b => String(b.id) === String(formData.branch_id))
      if (!selected) {
        setError('Selected branch is invalid. Please load branches or create one first.')
        setIsLoading(false)
        return
      }
      // Coerce numeric IDs if they look numeric, otherwise send as provided
      const maybeNum = Number(formData.branch_id)
      payload.branch_id = Number.isNaN(maybeNum) ? formData.branch_id : maybeNum

      if (isStudent && formData.reg_number) {
        payload.reg_number = formData.reg_number.trim()
      }

      // Do not send empty reg_number field
      if (typeof payload.reg_number === 'string' && payload.reg_number.trim() === '') {
        delete payload.reg_number
      }

      const response = await authFetch('https://restaurant-bn-api.onrender.com/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to add user'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            const details = errorData.errors.map((e: any) => e.message || e).join('; ')
            errorMessage = `${errorMessage}${details ? ` — ${details}` : ''}`
          }
        } catch {
          try {
            const text = await response.text()
            if (text) {
              errorMessage = `${errorMessage} — ${text.slice(0, 300)}`
            }
          } catch {}
        }
        if (response.status === 401) {
          errorMessage = 'Unauthorized. Your session may have expired or lacks permission.'
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      const result = await response.json()
      setSuccessMessage('User added successfully!')
      // Optimistically add
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
      
      // Reset form
      setFormData({
        full_name: "",
        phone: "",
        role: "student",
        branch_id: "",
        password: "",
        reg_number: "",
      })
      
      // Attempt to refresh from server if authorized; otherwise optimistic row remains
      // Moved fetching outside the handler to the mount effect
      
      // Close sheet after 2 seconds
      setTimeout(() => {
        setIsAddUserOpen(false)
        setSuccessMessage("")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user')
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

      const response = await authFetch('https://restaurant-bn-api.onrender.com/api/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Backend expects prices too; send as strings to match existing records
          name: branchForm.name,
          campus: branchForm.campus,
          regular_price: String(Number(branchForm.regular_price)),
          vip_price: String(Number(branchForm.vip_price)),
          vvip_price: String(Number(branchForm.vvip_price)),
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to add branch'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            const details = errorData.errors.map((e: any) => e.message || e).join('; ')
            errorMessage = `${errorMessage}${details ? ` — ${details}` : ''}`
          }
        } catch {}
        if (response.status === 401) {
          errorMessage = 'Unauthorized. Your session may have expired or lacks permission.'
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      await response.json()
      setSuccessMessage('Branch added successfully!')

      // Reset form
      setBranchForm({
        name: "",
        campus: "University of Rwanda",
        regular_price: 800,
        vip_price: 1200,
        vvip_price: 1800,
      })

      // Close sheet after 2 seconds
      setTimeout(() => {
        setIsAddBranchOpen(false)
        setSuccessMessage("")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add branch')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Only admins can access this page
  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <main className="wrapper">
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-500">Access Denied: Admin Only</p>
        </div>
      </main>
    )
  }

  return (
    <main className="wrapper">
      <Header
        title="User Management"
        description="Manage all users in the system"
        action={
          <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
        }
      />

      <ActionsBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddUser={() => { setIsAddUserOpen(true); fetchBranches(); }}
        onOpenAddBranch={() => setIsAddBranchOpen(true)}
      />

      <UsersTable
        users={filteredUsers}
        isLoading={usersLoading}
        onView={(user) => { setSelectedUser(user); setIsViewUserOpen(true); ensureBranchPresent(user.branch_id) }}
        onEdit={(user) => { setSelectedUser(user); setIsEditUserOpen(true); ensureBranchPresent(user.branch_id) }}
        onAdminResetPassword={async (user) => {
          try {
            setError("")
            const tokenError = ensureValidTokenOrMessage()
            if (tokenError) { setError(tokenError); return }
            const resp = await authFetch('https://restaurant-bn-api.onrender.com/api/users/admin-reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: user.id }),
            })
            if (!resp.ok) {
              let msg = 'Failed to admin reset password'
              try { const j = await resp.json(); msg = j.message || msg } catch {
                try { const t = await resp.text(); if (t) msg = `${msg} — ${t}` } catch {}
              }
              setError(msg)
              return
            }
            const data = await resp.json()
            const newPwd = data?.data?.new_password
            setSuccessMessage(data?.message || 'Admin password reset successful')
            if (newPwd) {
              setNewPwdValue(String(newPwd))
              setShowNewPwdModal(true)
            }
            setTimeout(() => setSuccessMessage(''), 2500)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Admin reset failed')
          }
        }}
        onDelete={async (user) => {
          try {
            const tokenError = ensureValidTokenOrMessage()
            if (tokenError) { setError(tokenError); return }
            const resp = await authFetch(`https://restaurant-bn-api.onrender.com/api/users/${user.id}`, { method: 'DELETE' })
            if (!resp.ok) {
              let msg = 'Failed to delete user'
              try { const j = await resp.json(); msg = j.message || j.error || msg } catch {}
              setError(msg)
              return
            }
            setSuccessMessage('User deleted')
            dispatch(removeUserOptimistic(user.id))
            setTimeout(() => setSuccessMessage(''), 2000)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Delete failed')
          }
        }}
      />

      <AddUserSheet
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        error={error}
        action = {"Add User"}
        successMessage={successMessage}
        isLoading={isLoading}
        formData={formData}
        setFormData={setFormData}
        branches={branches}
        staticBranches={staticBranches}
        roles={roleState.roles}
        onSubmit={handleAddUser}
      />

      <AddBranchSheet
        open={isAddBranchOpen}
        onOpenChange={setIsAddBranchOpen}
        error={error}
        successMessage={successMessage}
        isLoading={isLoading}
        branchForm={branchForm}
        setBranchForm={setBranchForm}
        onSubmit={handleAddBranch}
      />

      {/* View User Sheet (read-only using AddUserSheet) */}
      {selectedUser && (
        <AddUserSheet
          open={isViewUserOpen}
          onOpenChange={(v) => { setIsViewUserOpen(v); if (!v) setSelectedUser(null) }}
          error={""}
          action ={"View User"}
          successMessage={""}
          isLoading={false}
          formData={{
            full_name: selectedUser.full_name,
            phone: selectedUser.phone,
            role: selectedUser.role,
            branch_id: selectedUser.branch_id,
            password: '',
            reg_number: selectedUser?.student?.reg_number || ''
          }}
          setFormData={() => {}}
          branches={branches}
          staticBranches={staticBranches}
          roles={roleState.roles}
          onSubmit={(e) => { e.preventDefault(); setIsViewUserOpen(false) }}
        />
      )}

      {/* Edit User Sheet */}
      {selectedUser && (
        <AddUserSheet
          open={isEditUserOpen}
          onOpenChange={(v) => { setIsEditUserOpen(v); if (!v) setSelectedUser(null) }}
          error={error}
          action = {"Edit User"}
          successMessage={successMessage}
          isLoading={isLoading}
          formData={{
            full_name: selectedUser.full_name,
            phone: selectedUser.phone,
            role: selectedUser.role,
            branch_id: selectedUser.branch_id,
            password: '',
            reg_number: selectedUser?.student?.reg_number || ''
          }}
          setFormData={(fd) => {
            if (!selectedUser) return
            setSelectedUser({
              ...selectedUser,
              full_name: fd.full_name,
              phone: fd.phone,
              role: fd.role,
              branch_id: fd.branch_id,
              student: { reg_number: fd.reg_number },
            })
          }}
          branches={branches}
          staticBranches={staticBranches}
          roles={roleState.roles}
          onSubmit={async (e) => {
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
              const resp = await authFetch(`https://restaurant-bn-api.onrender.com/api/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              })
              if (!resp.ok) {
                let msg = 'Failed to update user'
                try { const j = await resp.json(); msg = j.message || j.error || msg } catch {}
                setError(msg)
                setIsLoading(false)
                return
              }
              setSuccessMessage('User updated')
              dispatch(updateUserOptimistic({ id: selectedUser.id, ...body, student: selectedUser.student }))
              setIsEditUserOpen(false)
              setTimeout(() => setSuccessMessage(''), 2000)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Update failed')
            } finally {
              setIsLoading(false)
            }
          }}
        />
      )}

      {/* New Password Modal */}
      {showNewPwdModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewPwdModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900">New Password Generated</h3>
            <p className="mt-2 text-sm text-gray-600">Share this temporary password with the user and advise them to change it after login.</p>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={newPwdValue}
                className="flex-1 border rounded-md px-3 py-2 font-mono text-sm"
              />
              <button
                type="button"
                className="px-3 py-2 text-sm rounded-md border border-slate-200 hover:bg-slate-50"
                onClick={() => {
                  navigator.clipboard?.writeText?.(newPwdValue)
                }}
                title="Copy password"
              >Copy</button>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border border-slate-200 hover:bg-slate-50"
                onClick={() => setShowNewPwdModal(false)}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
