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
import { useAppDispatch, useAppSelector } from "~/store/hooks"
import { setRoles } from "~/store/rolesSlice"
import { UserRole } from "~/types/auth"

interface User {
  id: string
  full_name: string
  phone: string
  role: string
  branch_id: string
  created_at: string
  reg_number?: string
}

interface BranchOption {
  id: string
  name: string
}

export default function UsersPage() {
  const dispatch = useAppDispatch()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const roleState = useAppSelector((state) => state.roles)
  const [users, setUsers] = useState<User[]>([])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [branches, setBranches] = useState<BranchOption[]>([])

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    role: "Student",
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
    // Disabled fetch while backend GET is unauthorized
  }, [])

  const fetchUsers = async () => {
    try {
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) {
        console.error(tokenError)
        return
      }

      const response = await authFetch('https://restaurant-bn-api.onrender.com/api/users')
      if (response.ok) {
        const result = await response.json()
        setUsers(result.data || [])
      }
    } catch (err) {
      // Silent fail to avoid noisy logs
    }
  }

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

  const fetchRoles = async () => {
    try {
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) return
      const response = await authFetch('https://restaurant-bn-api.onrender.com/api/roles')
      if (response.ok) {
        const result = await response.json()
        const options = (result.data || []).map((r: any) => ({ id: r.id, name: r.name || r.role || r }))
        dispatch(setRoles(options))
      }
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

      const response = await authFetch('https://restaurant-bn-api.onrender.com/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role.toLowerCase(),
          branch_id: formData.branch_id,
          password: formData.password,
          ...(formData.role.toLowerCase() === 'student' && formData.reg_number ? { reg_number: formData.reg_number } : {}),
        }),
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
        } catch {}
        if (response.status === 401) {
          errorMessage = 'Unauthorized. Your session may have expired or lacks permission.'
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      const result = await response.json()
      setSuccessMessage('User added successfully!')
      
      // Reset form
      setFormData({
        full_name: "",
        phone: "",
        role: "Student",
        branch_id: "",
        password: "",
        reg_number: "",
      })
      
      fetchUsers()
      
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
        onOpenAddUser={() => { setIsAddUserOpen(true); fetchBranches(); fetchRoles(); }}
        onOpenAddBranch={() => setIsAddBranchOpen(true)}
      />

      <UsersTable users={filteredUsers} />

      <AddUserSheet
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        error={error}
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
    </main>
  )
}
