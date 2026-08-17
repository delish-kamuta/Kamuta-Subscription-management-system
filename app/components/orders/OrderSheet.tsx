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
import { createOrderThunk, updateOrderThunk } from "~/store/ordersSlice";
import type { Order, OrderCustomerType, OrderPaymentStatus } from "~/services/orders";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
  initialData?: Order | null;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

// Student groups pay cash upfront; campus orders are billed and paid later.
// The sheet reflects that: switching customer type nudges payment status,
// but the cashier can override both.
export function OrderSheet({ open, onOpenChange, onSuccess, initialData }: Props) {
  const dispatch = useAppDispatch();
  const branches = useAppSelector((s) => s.branches.items);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState<OrderCustomerType>("student");
  const [eventDate, setEventDate] = useState(todayISO());
  const [branchId, setBranchId] = useState("");
  const [portions, setPortions] = useState<number>(0);
  const [agreedPrice, setAgreedPrice] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>("paid");
  const [paidDate, setPaidDate] = useState<string>(todayISO());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setCustomerName(initialData.customer_name);
      setCustomerType(initialData.customer_type);
      setEventDate(initialData.event_date);
      setBranchId(initialData.branch_id);
      setPortions(initialData.portions);
      setAgreedPrice(initialData.agreed_price);
      setPaymentStatus(initialData.payment_status);
      setPaidDate(initialData.paid_date ?? todayISO());
      setNotes(initialData.notes ?? "");
    } else {
      setCustomerName("");
      setCustomerType("student");
      setEventDate(todayISO());
      setBranchId(branches[0]?.id ?? "");
      setPortions(0);
      setAgreedPrice(0);
      setPaymentStatus("paid");
      setPaidDate(todayISO());
      setNotes("");
    }
    setError("");
    setSuccess("");
  }, [open, initialData, branches]);

  // When the user picks a customer type, suggest the matching payment status —
  // but only when creating (don't overwrite an existing order's status on edit).
  const chooseType = (t: OrderCustomerType) => {
    setCustomerType(t);
    if (!initialData) {
      setPaymentStatus(t === "student" ? "paid" : "outstanding");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!customerName.trim()) return setError("Customer name is required");
    if (!branchId) return setError("Pick a branch");
    if (portions <= 0) return setError("Portions must be greater than 0");
    if (agreedPrice <= 0) return setError("Agreed price must be greater than 0");

    setLoading(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_type: customerType,
        event_date: eventDate,
        branch_id: branchId,
        portions,
        agreed_price: agreedPrice,
        payment_status: paymentStatus,
        paid_date: paymentStatus === "paid" ? paidDate : undefined,
        notes: notes.trim() || undefined,
      };
      if (initialData?.id) {
        await dispatch(updateOrderThunk({ id: initialData.id, payload })).unwrap();
        setSuccess("Order updated");
      } else {
        await dispatch(createOrderThunk(payload)).unwrap();
        setSuccess("Order created");
      }
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>{initialData ? "Edit order" : "New event order"}</SheetTitle>
          <SheetDescription>
            Record a food order from a student group or the campus. Cost is attached
            automatically from ingredient issues + the day's portion share.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer name / group *</label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Engineering Student Assoc."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer type *</label>
            <div className="flex gap-2">
              {(["student", "campus"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => chooseType(t)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border ${
                    customerType === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {t === "student" ? "Student group" : "Campus / school"}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Students usually pay upfront in cash. Campus is billed and paid later.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event date *</label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch *</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="" disabled>Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={String(b.id)}>{b.name || b.id}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Portions *</label>
              <Input
                type="number"
                min={1}
                value={portions}
                onChange={(e) => setPortions(Number(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Agreed price (RWF) *</label>
              <Input
                type="number"
                min={0}
                step="any"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(Number(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment status *</label>
            <div className="flex gap-2">
              {(["paid", "outstanding"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPaymentStatus(s)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border ${
                    paymentStatus === s
                      ? s === "paid"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-amber-600 text-white border-amber-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s === "paid" ? "Paid" : "Outstanding"}
                </button>
              ))}
            </div>
            {paymentStatus === "paid" && (
              <div className="pt-1">
                <label className="text-xs text-gray-500 block mb-1">Paid date</label>
                <Input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything special about the order — delivery time, allergens, contact person…"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Saving..." : initialData ? "Update order" : "Create order"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
