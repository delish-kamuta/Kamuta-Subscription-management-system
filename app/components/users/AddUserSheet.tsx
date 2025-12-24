import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import {useAppSelector } from "~/store/hooks"

type BranchOption = { id: string; name: string }

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  error: string
  successMessage: string
  isLoading: boolean
  action:string
  formData: {
    full_name: string
    phone: string
    role: string
    branch_id: string
    password: string
    reg_number: string
  }
  setFormData: (data: any) => void
  branches: BranchOption[]
  staticBranches: BranchOption[]
  roles?: { id?: string; name: string }[]
  onSubmit: (e: React.FormEvent) => void
}

export function AddUserSheet({ open, onOpenChange, error, successMessage, isLoading, formData, setFormData, branches,action, staticBranches, roles, onSubmit }: Props) {
  const branchOptions = branches.length > 0 ? branches : staticBranches
  const user = useAppSelector((state)=>state.auth.user)
  console.log()
  const roleOptions = (roles && roles.length > 0)
    ? roles
    : [
        { name: 'student' },
        { name: 'worker' },
        { name: 'cashier' },
        { name: 'scanner' },
        { name: 'Admin' },
      ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>{action}</SheetTitle>
          <SheetDescription>
            Fill in the details to create a new user account
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
          )}
          {successMessage && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{successMessage}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-medium">Full Name *</label>
            <Input id="full_name" type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required placeholder="John Doe" />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone Number *</label>
            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required placeholder="+250788123456" />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">Role *</label>
            <select id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              {roleOptions.map((r) => (
                <option key={r.id ?? r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          {formData.role.toLowerCase() === 'student' && (
            <div className="space-y-2">
              <label htmlFor="reg_number" className="text-sm font-medium">Registration Number *</label>
              <Input id="reg_number" type="text" value={formData.reg_number} onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })} required={formData.role.toLowerCase() === 'student'} placeholder="STU2024001" />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="branch_id" className="text-sm font-medium">Branch *</label>
            <select
              id="branch_id"
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              required={true}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a branch</option>
              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password {action.includes("Edit") ? "(Leave blank to keep unchanged)" : "*"}
            </label>
            <Input 
              id="password" 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required={!action.includes("Edit") && !action.includes("View")} 
              placeholder="••••••••" 
              minLength={6} 
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isLoading}>Cancel</Button>
            {!action.includes("View") && (
              <Button type="submit" className="flex-1 bg-primary-100 hover:bg-primary-100/90" disabled={isLoading}>
                {isLoading ? "Saving..." : action.includes("Edit") ? "Update User" : "Add User"}
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
