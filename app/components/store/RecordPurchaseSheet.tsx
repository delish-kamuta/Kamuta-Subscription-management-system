import { useEffect, useMemo, useState } from "react";
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
import { recordPurchaseThunk } from "~/store/storeSlice";
import type { PurchaseDestination, ValuationMode } from "~/services/store";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
};

// The storekeeper enters WHAT they bought and WHAT they paid — nothing else.
// Averages, on-hand quantities, and per-unit costs are the server's job.
export function RecordPurchaseSheet({ open, onOpenChange, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.store.items);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [itemId, setItemId] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemMinQty, setNewItemMinQty] = useState<number>(0);
  const [newItemValuationMode, setNewItemValuationMode] = useState<ValuationMode>("stocked");

  const [quantity, setQuantity] = useState<string>("");
  const [totalCost, setTotalCost] = useState<string>("");
  const [supplier, setSupplier] = useState("");
  const [destination, setDestination] = useState<PurchaseDestination>("store");
  const [directUseFor, setDirectUseFor] = useState<"buffet" | "snacks">("buffet");

  // Default the destination toggle from the picked item's valuation_mode.
  const selectedItem = useMemo(
    () => (itemId ? items.find((i) => i.id === itemId) : undefined),
    [itemId, items],
  );

  useEffect(() => {
    if (!open) return;
    if (selectedItem) {
      setDestination(selectedItem.valuation_mode === "direct_use" ? "buffet" : "store");
    }
  }, [open, selectedItem]);

  useEffect(() => {
    if (open) {
      setMode("existing");
      setItemId(items[0]?.id ?? "");
      setNewItemName("");
      setNewItemUnit("");
      setNewItemMinQty(0);
      setNewItemValuationMode("stocked");
      setQuantity("");
      setTotalCost("");
      setSupplier("");
      setDestination("store");
      setDirectUseFor("buffet");
      setError("");
      setSuccess("");
    }
  }, [open, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const qty = Number(quantity);
    const cost = Number(totalCost);
    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0");
      setLoading(false);
      return;
    }
    if (cost < 0) {
      setError("Total cost cannot be negative");
      setLoading(false);
      return;
    }

    try {
      await dispatch(
        recordPurchaseThunk({
          item_id: mode === "existing" ? itemId : undefined,
          new_item:
            mode === "new"
              ? {
                  name: newItemName.trim(),
                  unit: newItemUnit.trim(),
                  min_quantity: newItemMinQty,
                  valuation_mode: newItemValuationMode,
                }
              : undefined,
          quantity: qty,
          total_cost: cost,
          supplier: supplier.trim() || undefined,
          destination,
          direct_use_for: destination === "store" ? undefined : directUseFor,
        }),
      ).unwrap();

      setSuccess("Purchase recorded");
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1200);
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to record purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>Record Purchase</SheetTitle>
          <SheetDescription>
            Enter what you bought and what you paid. The average cost is calculated for you.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`px-3 py-1 rounded-md border ${mode === "existing" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"}`}
            >
              Existing item
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={`px-3 py-1 rounded-md border ${mode === "new" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"}`}
            >
              New item
            </button>
          </div>

          {mode === "existing" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Item *</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="" disabled>Select an item</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.unit}) — {i.quantity_on_hand} on hand
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "new" && (
            <div className="space-y-3 border rounded-md p-3 bg-gray-50">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required placeholder="e.g. Onions" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit *</label>
                  <Input value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)} required placeholder="kg, L, pcs" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min qty (alert)</label>
                  <Input type="number" min={0} value={newItemMinQty} onChange={(e) => setNewItemMinQty(Number(e.target.value) || 0)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default handling</label>
                <select
                  value={newItemValuationMode}
                  onChange={(e) => setNewItemValuationMode(e.target.value as ValuationMode)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="stocked">Stocked (goes on the shelf)</option>
                  <option value="direct_use">Direct use (used the same day, not stored)</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity *</label>
              <Input type="number" min={0} step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required placeholder="e.g. 25" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total cost (RWF) *</label>
              <Input type="number" min={0} step="any" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} required placeholder="e.g. 30000" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Supplier (optional)</label>
            <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Name of supplier" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Destination</label>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setDestination("store")}
                className={`flex-1 px-3 py-2 rounded-md border ${destination === "store" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"}`}
              >
                Put in store
              </button>
              <button
                type="button"
                onClick={() => setDestination(directUseFor)}
                className={`flex-1 px-3 py-2 rounded-md border ${destination !== "store" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"}`}
              >
                Use straight away
              </button>
            </div>
            {destination !== "store" && (
              <div className="pt-2">
                <label className="text-xs text-gray-500 block mb-1">Used for</label>
                <select
                  value={directUseFor}
                  onChange={(e) => {
                    const v = e.target.value as "buffet" | "snacks";
                    setDirectUseFor(v);
                    setDestination(v);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="buffet">Buffet (today's lunch)</option>
                  <option value="snacks">Shop production (chapati, mandazi…)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Cost flows into the P&amp;L under the matching "direct-use" line, and into the produced item's ingredient cost.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Recording..." : "Record purchase"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
