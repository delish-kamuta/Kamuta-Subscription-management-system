import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { createWorkerThunk, updateWorkerThunk } from "~/store/payrollSlice";
import type { PayrollWorker } from "~/services/payroll";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
  initialData?: PayrollWorker | null;
};

// Simple estimate of daily cost so admin sees the impact immediately.
const daysInThisMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
};

export function WorkerSheet({ open, onOpenChange, onSuccess, initialData }: Props) {
  const dispatch = useAppDispatch();
  const branches = useAppSelector((s) => s.branches.items);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    role: "",
    branch_id: "",
    monthly_salary: 0,
    active: true,
  });

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setFormData({
        full_name: initialData.full_name,
        phone: initialData.phone ?? "",
        role: initialData.role,
        branch_id: initialData.branch_id,
        monthly_salary: initialData.monthly_salary,
        active: initialData.active,
      });
    } else {
      setFormData({
        full_name: "",
        phone: "",
        role: "",
        branch_id: branches[0]?.id ?? "",
        monthly_salary: 0,
        active: true,
      });
    }
    setError("");
    setSuccess("");
  }, [open, initialData, branches]);

  const dailyEstimate = formData.monthly_salary > 0
    ? Math.round(formData.monthly_salary / daysInThisMonth())
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (initialData?.id) {
        await dispatch(
          updateWorkerThunk({ id: initialData.id, payload: formData }),
        ).unwrap();
        setSuccess("Worker updated");
      } else {
        await dispatch(createWorkerThunk(formData)).unwrap();
        setSuccess("Worker added");
      }
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to save worker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>{initialData ? "Edit worker" : "Add worker"}</SheetTitle>
          <SheetDescription>
            Monthly salary drives the daily labor cost in the P&amp;L. Advances and deductions are
            tracked separately on the worker's row.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Full name *</label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              placeholder="e.g. Alice Cook"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="078XXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role / position *</label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                placeholder="Cook, Baker, Kitchen assistant…"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Branch *</label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="" disabled>Select a branch</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)}>{b.name || b.id}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Monthly salary (RWF) *</label>
            <Input
              type="number"
              min={0}
              step="any"
              value={formData.monthly_salary}
              onChange={(e) => setFormData({ ...formData, monthly_salary: Number(e.target.value) || 0 })}
              required
            />
            {dailyEstimate > 0 && (
              <p className="text-xs text-gray-500">
                ≈ <span className="font-mono">{dailyEstimate.toLocaleString()} RWF/day</span> this
                month ({daysInThisMonth()} days)
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            Active — include in daily labor cost
          </label>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Saving..." : initialData ? "Update" : "Add worker"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
