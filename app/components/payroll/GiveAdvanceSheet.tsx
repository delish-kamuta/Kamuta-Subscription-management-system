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
import { recordAdvanceThunk } from "~/store/payrollSlice";
import type { PayrollWorker } from "~/services/payroll";
import { formatCurrency } from "~/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  worker: PayrollWorker | null;
  onSuccess?: () => void;
};

// Advances = money given to a worker before month-end (urgent needs).
// They are cash-flow only — they don't change the daily cost, they just reduce
// the net payout at the end of the month.
export function GiveAdvanceSheet({ open, onOpenChange, worker, onSuccess }: Props) {
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
    if (amt > worker.monthly_salary) {
      setError(`Advance cannot exceed the monthly salary (${formatCurrency(worker.monthly_salary)})`);
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await dispatch(
        recordAdvanceThunk({
          workerId: worker.id,
          payload: {
            amount: amt,
            reason: reason.trim() || undefined,
            given_by: currentUser?.id,
          },
        }),
      ).unwrap();
      setSuccess("Advance recorded");
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to record advance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>Give advance</SheetTitle>
          <SheetDescription>
            {worker
              ? `To ${worker.full_name} (${worker.role}). Monthly salary: ${formatCurrency(worker.monthly_salary)}.`
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
              placeholder="e.g. 20000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (optional)</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. hospital bill, school fees"
            />
          </div>

          <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">
            Advances reduce the worker's month-end net payout. They don't change the daily labor cost
            in the P&amp;L — the salary is still spread across the month as accrued.
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !worker} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Recording..." : "Record advance"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
