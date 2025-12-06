import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  error: string
  successMessage: string
  isLoading: boolean
  branchForm: {
    name: string
    campus: string
    regular_price: number
    vip_price: number
    vvip_price: number
  }
  setBranchForm: (data: any) => void
  onSubmit: (e: React.FormEvent) => void
}

export function AddBranchSheet({ open, onOpenChange, error, successMessage, isLoading, branchForm, setBranchForm, onSubmit }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>Add New Branch</SheetTitle>
          <SheetDescription>Provide branch details to create a new campus branch</SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {successMessage && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{successMessage}</div>}

          <div className="space-y-2">
            <label htmlFor="branch_name" className="text-sm font-medium">Branch Name *</label>
            <Input id="branch_name" type="text" value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} required placeholder="Kigali Campus" />
          </div>

          <div className="space-y-2">
            <label htmlFor="campus" className="text-sm font-medium">Campus *</label>
            <Input id="campus" type="text" value={branchForm.campus} onChange={(e) => setBranchForm({ ...branchForm, campus: e.target.value })} required placeholder="University of Rwanda" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="regular_price" className="text-sm font-medium">Regular Price *</label>
              <Input id="regular_price" type="number" value={branchForm.regular_price} onChange={(e) => setBranchForm({ ...branchForm, regular_price: Number(e.target.value) })} required min={0} />
            </div>
            <div className="space-y-2">
              <label htmlFor="vip_price" className="text-sm font-medium">VIP Price *</label>
              <Input id="vip_price" type="number" value={branchForm.vip_price} onChange={(e) => setBranchForm({ ...branchForm, vip_price: Number(e.target.value) })} required min={0} />
            </div>
            <div className="space-y-2">
              <label htmlFor="vvip_price" className="text-sm font-medium">VVIP Price *</label>
              <Input id="vvip_price" type="number" value={branchForm.vvip_price} onChange={(e) => setBranchForm({ ...branchForm, vvip_price: Number(e.target.value) })} required min={0} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isLoading}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary-100 hover:bg-primary-100/90" disabled={isLoading}>{isLoading ? "Adding..." : "Add Branch"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
