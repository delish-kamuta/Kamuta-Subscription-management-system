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
import { recordDeductionThunk } from "~/store/payrollSlice";
import type { PayrollWorker } from "~/services/payroll";
import { formatCurrency } from "~/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  worker: PayrollWorker | null;
  onSuccess?: () => void;
};

// Deductions = money taken off the worker's salary for a specific reason
// (broke a dish, was late, mishandled cash…). Reduces month-end payout.
export function ApplyDeductionSheet({ open, onOpenChange, worker, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open) {
      setAmount("");
      setReason("");
      setError("");
      setSuccess("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    if (!reason.trim()) {
      setError("A reason is required for a deduction");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await dispatch(
        recordDeductionThunk({
          workerId: worker.id,
          payload: {
            amount: amt,
            reason: reason.trim(),
            applied_by: currentUser?.id,
          },
        }),
      ).unwrap();
      setSuccess("Deduction applied");
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to apply deduction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>Apply deduction</SheetTitle>
          <SheetDescription>
            {worker
              ? `From ${worker.full_name} (${worker.role}). Monthly salary: ${formatCurrency(worker.monthly_salary)}.`
              : "Select a worker first."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (RWF) *</label>
            <Input
              type="number"
              min={0}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="e.g. 5000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason *</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="e.g. broke serving dish, cash shortage"
            />
            <p className="text-xs text-gray-500">
              Reason is required — it stays on the record so the worker (and payroll audit) knows why.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !worker} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? "Applying..." : "Apply deduction"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
