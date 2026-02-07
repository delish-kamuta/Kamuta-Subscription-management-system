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
    student_regular_price: number
    student_vip_price: number
    student_vvip_price: number
    worker_regular_price: number
    worker_vip_price: number
    worker_vvip_price: number
    student_leader_regular_price: number
    student_leader_vip_price: number
    student_leader_vvip_price: number
    irregular_student_regular_price: number
    irregular_student_vip_price: number
    irregular_student_vvip_price: number
    irregular_worker_regular_price: number
    irregular_worker_vip_price: number
    irregular_worker_vvip_price: number
  }
  setBranchForm: (data: any) => void
  onSubmit: (e: React.FormEvent) => void
  title?: string
  submitLabel?: string
}

export function AddBranchSheet({ open, onOpenChange, error, successMessage, isLoading, branchForm, setBranchForm, onSubmit, title = "Add New Branch", submitLabel = "Add Branch" }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Provide branch details</SheetDescription>
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

          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-1">Student Prices</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="student_regular_price" className="text-sm font-medium">Regular *</label>
                <Input id="student_regular_price" type="number" step="0.01" value={branchForm.student_regular_price} onChange={(e) => setBranchForm({ ...branchForm, student_regular_price: Number(e.target.value) })} required min={0} />
              </div>
              <div className="space-y-2">
                <label htmlFor="student_vip_price" className="text-sm font-medium">VIP *</label>
                <Input id="student_vip_price" type="number" step="0.01" value={branchForm.student_vip_price} onChange={(e) => setBranchForm({ ...branchForm, student_vip_price: Number(e.target.value) })} required min={0} />
              </div>
              <div className="space-y-2">
                <label htmlFor="student_vvip_price" className="text-sm font-medium">VVIP *</label>
                <Input id="student_vvip_price" type="number" step="0.01" value={branchForm.student_vvip_price} onChange={(e) => setBranchForm({ ...branchForm, student_vvip_price: Number(e.target.value) })} required min={0} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-1">Worker Prices</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="worker_regular_price" className="text-sm font-medium">Regular *</label>
                <Input id="worker_regular_price" type="number" step="0.01" value={branchForm.worker_regular_price} onChange={(e) => setBranchForm({ ...branchForm, worker_regular_price: Number(e.target.value) })} required min={0} />
              </div>
              <div className="space-y-2">
                <label htmlFor="worker_vip_price" className="text-sm font-medium">VIP *</label>
                <Input id="worker_vip_price" type="number" step="0.01" value={branchForm.worker_vip_price} onChange={(e) => setBranchForm({ ...branchForm, worker_vip_price: Number(e.target.value) })} required min={0} />
              </div>
              <div className="space-y-2">
                <label htmlFor="worker_vvip_price" className="text-sm font-medium">VVIP *</label>
                <Input id="worker_vvip_price" type="number" step="0.01" value={branchForm.worker_vvip_price} onChange={(e) => setBranchForm({ ...branchForm, worker_vvip_price: Number(e.target.value) })} required min={0} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-1">Student Leader Prices</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="student_leader_regular_price" className="text-sm font-medium">Regular *</label>
                <Input id="student_leader_regular_price" type="number" step="0.01" value={branchForm.student_leader_regular_price} onChange={(e) => setBranchForm({ ...branchForm, student_leader_regular_price: Number(e.target.value) })} required min={0} />
              </div>
              <div className="space-y-2">
                <label htmlFor="student_leader_vip_price" className="text-sm font-medium">VIP *</label>
                <Input id="student_leader_vip_price" type="number" step="0.01" value={branchForm.student_leader_vip_price} onChange={(e) => setBranchForm({ ...branchForm, student_leader_vip_price: Number(e.target.value) })} required min={0} />
              </div>
              <div className="space-y-2">
                <label htmlFor="student_leader_vvip_price" className="text-sm font-medium">VVIP *</label>
                <Input id="student_leader_vvip_price" type="number" step="0.01" value={branchForm.student_leader_vvip_price} onChange={(e) => setBranchForm({ ...branchForm, student_leader_vvip_price: Number(e.target.value) })} required min={0} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-1">Irregular Student Prices</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="irregular_student_regular_price" className="text-sm font-medium">Regular *</label>
                <Input id="irregular_student_regular_price" type="number" step="0.01" value={branchForm.irregular_student_regular_price} onChange={(e) => setBranchForm({ ...branchForm, irregular_student_regular_price: Number(e.target.value) })} required min={0} />
              </div>
              <div className="space-y-2">
                <label htmlFor="irregular_student_vip_price" className="text-sm font-medium">VIP *</label>
                <Input id="irregular_student_vip_price" type="number" step="0.01" value={branchForm.irregular_student_vip_price} onChange={(e) => setBranchForm({ ...branchForm, irregular_student_vip_price: Number(e.target.value) })} required min={0} />
              </div>
              <div className="space-y-2">
                <label htmlFor="irregular_student_vvip_price" className="text-sm font-medium">VVIP *</label>
                <Input id="irregular_student_vvip_price" type="number" step="0.01" value={branchForm.irregular_student_vvip_price} onChange={(e) => setBranchForm({ ...branchForm, irregular_student_vvip_price: Number(e.target.value) })} required min={0} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-1">Irregular Worker Prices</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="irregular_worker_regular_price" className="text-sm font-medium">Regular *</label>
                <Input id="irregular_worker_regular_price" type="number" step="0.01" value={branchForm.irregular_worker_regular_price} onChange={(e) => setBranchForm({ ...branchForm, irregular_worker_regular_price: Number(e.target.value) })} required min={0} />
              </div>
              <div className="space-y-2">
                <label htmlFor="irregular_worker_vip_price" className="text-sm font-medium">VIP *</label>
                <Input id="irregular_worker_vip_price" type="number" step="0.01" value={branchForm.irregular_worker_vip_price} onChange={(e) => setBranchForm({ ...branchForm, irregular_worker_vip_price: Number(e.target.value) })} required min={0} />
              </div>
              <div className="space-y-2">
                <label htmlFor="irregular_worker_vvip_price" className="text-sm font-medium">VVIP *</label>
                <Input id="irregular_worker_vvip_price" type="number" step="0.01" value={branchForm.irregular_worker_vvip_price} onChange={(e) => setBranchForm({ ...branchForm, irregular_worker_vvip_price: Number(e.target.value) })} required min={0} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isLoading}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary-100 hover:bg-primary-100/90" disabled={isLoading}>{isLoading ? "Saving..." : submitLabel}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
