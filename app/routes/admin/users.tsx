import { Header } from "../../../components/Header"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useState, useEffect } from "react"
import { authFetch, ensureValidTokenOrMessage } from "~/lib/api"
import { Plus, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { useAppSelector } from "~/store/hooks"
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
  const { user: currentUser } = useAppSelector((state) => state.auth)
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

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button
            onClick={() => { setIsAddUserOpen(true); fetchBranches(); }}
            className="bg-primary-100 hover:bg-primary-100/90 flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
          <Button
            onClick={() => setIsAddBranchOpen(true)}
            variant="outline"
            className="flex-1"
          >
            Add Branch
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Registration Number</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No users found. Note: User list API currently returns 401 Unauthorized.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{user.reg_number || '-'}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Sheet */}
      <Sheet open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <SheetContent className="overflow-y-auto bg-white p-6">
          <SheetHeader>
            <SheetTitle>Add New User</SheetTitle>
            <SheetDescription>
              Fill in the details to create a new user account
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleAddUser} className="space-y-4 mt-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-medium">
                Full Name *
              </label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number *
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+250788123456"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Student">Student</option>
                <option value="Cashier">Cashier</option>
                <option value="Admin">Admin</option>
                <option value="Waitstaff">Waitstaff</option>
              </select>
            </div>

            {formData.role.toLowerCase() === 'student' && (
              <div className="space-y-2">
                <label htmlFor="reg_number" className="text-sm font-medium">
                  Registration Number *
                </label>
                <Input
                  id="reg_number"
                  type="text"
                  value={formData.reg_number}
                  onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })}
                  required={formData.role.toLowerCase() === 'student'}
                  placeholder="STU2024001"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="branch_id" className="text-sm font-medium">
                Branch *
              </label>
              <select
                id="branch_id"
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a branch</option>
                {(branches.length > 0 ? branches : staticBranches).map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password *
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserOpen(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary-100 hover:bg-primary-100/90"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add User"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add Branch Sheet */}
      <Sheet open={isAddBranchOpen} onOpenChange={setIsAddBranchOpen}>
        <SheetContent className="overflow-y-auto bg-white p-6">
          <SheetHeader>
            <SheetTitle>Add New Branch</SheetTitle>
            <SheetDescription>
              Provide branch details to create a new campus branch
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleAddBranch} className="space-y-4 mt-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="branch_name" className="text-sm font-medium">
                Branch Name *
              </label>
              <Input
                id="branch_name"
                type="text"
                value={branchForm.name}
                onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                required
                placeholder="Kigali Campus"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="campus" className="text-sm font-medium">
                Campus *
              </label>
              <Input
                id="campus"
                type="text"
                value={branchForm.campus}
                onChange={(e) => setBranchForm({ ...branchForm, campus: e.target.value })}
                required
                placeholder="University of Rwanda"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="regular_price" className="text-sm font-medium">
                  Regular Price *
                </label>
                <Input
                  id="regular_price"
                  type="number"
                  value={branchForm.regular_price}
                  onChange={(e) => setBranchForm({ ...branchForm, regular_price: Number(e.target.value) })}
                  required
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="vip_price" className="text-sm font-medium">
                  VIP Price *
                </label>
                <Input
                  id="vip_price"
                  type="number"
                  value={branchForm.vip_price}
                  onChange={(e) => setBranchForm({ ...branchForm, vip_price: Number(e.target.value) })}
                  required
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="vvip_price" className="text-sm font-medium">
                  VVIP Price *
                </label>
                <Input
                  id="vvip_price"
                  type="number"
                  value={branchForm.vvip_price}
                  onChange={(e) => setBranchForm({ ...branchForm, vvip_price: Number(e.target.value) })}
                  required
                  min={0}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddBranchOpen(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary-100 hover:bg-primary-100/90"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Branch"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </main>
  )
}
