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
import { addWasteThunk } from "~/store/shopSlice";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

// Waste has to exist or waste shows up as theft in the cash reconciliation.
export function RecordShopWasteSheet({ open, onOpenChange }: Props) {
  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.shop.products);
  const session = useAppSelector((s) => s.shop.currentSession);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open) {
      setProductId(products[0]?.id ?? "");
      setQuantity("");
      setReason("");
      setError("");
      setSuccess("");
    }
  }, [open, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.id) {
      setError("No open session");
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    if (!reason.trim()) {
      setError("Please give a reason (drop, spoilage, giveaway, etc.)");
      return;
    }
    setLoading(true);
    try {
      await dispatch(
        addWasteThunk({
          sessionId: session.id,
          payload: { product_id: productId, quantity: qty, reason: reason.trim() },
        }),
      ).unwrap();
      setSuccess("Waste recorded");
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to record waste");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>Record waste / giveaway</SheetTitle>
          <SheetDescription>
            Log dropped, spoiled, or given-away items. This keeps the cash reconciliation honest.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Product *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="" disabled>Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity *</label>
            <Input type="number" min={0} step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason *</label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="e.g. dropped, spoilage, giveaway to staff" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Recording..." : "Record waste"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
