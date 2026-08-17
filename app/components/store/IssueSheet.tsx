import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
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
import { issueToKitchenThunk } from "~/store/storeSlice";
import { fetchOrdersThunk } from "~/store/ordersSlice";
import type { IssuePurpose } from "~/services/store";

type Line = {
  key: string; // local-only id for the list
  item_id: string;
  quantity: string;
  purpose: IssuePurpose;
  intended_product: string;
  order_id: string;   // required when purpose === "order"
};

const blankLine = (): Line => ({
  key: Math.random().toString(36).slice(2),
  item_id: "",
  quantity: "",
  purpose: "buffet",
  intended_product: "",
  order_id: "",
});

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
};

// Storekeeper enters ITEMS + QUANTITIES + PURPOSE per line. No money.
// Server attaches unit_cost + total_cost at current average.
// Purpose "order" is used to attribute ingredients to a specific event order
// (student group / campus meeting) — the order picker appears when selected.
export function IssueSheet({ open, onOpenChange, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.store.items);
  const orders = useAppSelector((s) => s.orders.items);
  const ordersLoaded = useAppSelector((s) => s.orders.loaded);

  // Load orders once when the sheet opens so the picker has options.
  useEffect(() => {
    if (open && !ordersLoaded) {
      dispatch(fetchOrdersThunk({ status: "outstanding" }));
    }
  }, [open, ordersLoaded, dispatch]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lines, setLines] = useState<Line[]>([blankLine()]);

  useEffect(() => {
    if (open) {
      setLines([blankLine()]);
      setError("");
      setSuccess("");
    }
  }, [open]);

  const setLine = (key: string, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const addLine = () => setLines((prev) => [...prev, blankLine()]);
  const removeLine = (key: string) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));

  // Client-side warning: refuse to submit if any stocked line exceeds on-hand.
  const overIssuedLines = lines
    .map((l) => {
      const item = items.find((i) => i.id === l.item_id);
      if (!item || item.valuation_mode !== "stocked") return null;
      const qty = Number(l.quantity);
      if (!qty || qty <= 0) return null;
      return qty > item.quantity_on_hand ? { line: l, item } : null;
    })
    .filter(Boolean) as Array<{ line: Line; item: (typeof items)[number] }>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate.
    for (const l of lines) {
      if (!l.item_id) {
        setError("Every line needs an item selected");
        setLoading(false);
        return;
      }
      const qty = Number(l.quantity);
      if (!qty || qty <= 0) {
        setError("Every line needs a quantity greater than 0");
        setLoading(false);
        return;
      }
      if (l.purpose === "order" && !l.order_id) {
        setError("Every 'Order' line needs an order selected");
        setLoading(false);
        return;
      }
    }
    if (overIssuedLines.length > 0) {
      setError(
        `${overIssuedLines.length} line(s) exceed on-hand quantity. Adjust before issuing.`,
      );
      setLoading(false);
      return;
    }

    try {
      await dispatch(
        issueToKitchenThunk({
          lines: lines.map((l) => ({
            item_id: l.item_id,
            quantity: Number(l.quantity),
            purpose: l.purpose,
            intended_product: l.intended_product.trim() || undefined,
            order_id: l.purpose === "order" ? l.order_id : undefined,
          })),
        }),
      ).unwrap();
      setSuccess("Issued to kitchen");
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1200);
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Issue to Kitchen</SheetTitle>
          <SheetDescription>
            Pick items and quantities. Cost is attached automatically at the current
            average — you don't type any money.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="space-y-3">
            {lines.map((l, idx) => {
              const overIssue = overIssuedLines.find((o) => o.line.key === l.key);
              return (
                <div key={l.key} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Line {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeLine(l.key)}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-30"
                      disabled={lines.length === 1}
                      title="Remove line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-3">
                      <label className="text-xs text-gray-500 block mb-1">Item</label>
                      <select
                        value={l.item_id}
                        onChange={(e) => setLine(l.key, { item_id: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                      >
                        <option value="" disabled>Select item</option>
                        {items.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.unit}) {i.valuation_mode === "stocked" ? `— ${i.quantity_on_hand} on hand` : "— direct-use"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs text-gray-500 block mb-1">Qty</label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={l.quantity}
                        onChange={(e) => setLine(l.key, { quantity: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Purpose</label>
                      <select
                        value={l.purpose}
                        onChange={(e) => setLine(l.key, {
                          purpose: e.target.value as IssuePurpose,
                          // Clear order_id when moving away from "order"
                          order_id: e.target.value === "order" ? l.order_id : "",
                        })}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                      >
                        <option value="buffet">Buffet</option>
                        <option value="snacks">Shop production (chapati, mandazi…)</option>
                        <option value="order">Order (event)</option>
                      </select>
                    </div>
                  </div>
                  {l.purpose === "order" && (
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Order *</label>
                      <select
                        value={l.order_id}
                        onChange={(e) => setLine(l.key, { order_id: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                      >
                        <option value="" disabled>Pick an order</option>
                        {orders
                          .slice()
                          .sort((a, b) => (a.event_date < b.event_date ? 1 : -1))
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.event_date} — {o.customer_name} ({o.portions} portions)
                            </option>
                          ))}
                      </select>
                      {orders.length === 0 && (
                        <p className="text-xs text-amber-700 mt-1">
                          No orders yet. Create one on the Event Orders page first.
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Intended product (optional)</label>
                    <Input
                      value={l.intended_product}
                      onChange={(e) => setLine(l.key, { intended_product: e.target.value })}
                      placeholder="e.g. Chapati, Beef stew"
                    />
                  </div>
                  {overIssue && (
                    <div className="text-xs text-red-600">
                      Only {overIssue.item.quantity_on_hand} {overIssue.item.unit} of {overIssue.item.name} available.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Add another line
          </button>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Issuing..." : "Issue to kitchen"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
