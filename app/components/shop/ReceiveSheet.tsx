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
import { addReceiptThunk } from "~/store/shopSlice";

type Kind = "produced" | "bought";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kind: Kind;
};

// Handles both "Receive production" (cook's output — no cost) and
// "Receive bought goods" (sodas etc. — includes buying cost).
export function ReceiveSheet({ open, onOpenChange, kind }: Props) {
  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.shop.products);
  const session = useAppSelector((s) => s.shop.currentSession);

  const eligibleProducts = useMemo(
    () => products.filter((p) => p.active && p.source === kind),
    [products, kind],
  );

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyingCost, setBuyingCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open) {
      setProductId(eligibleProducts[0]?.id ?? "");
      setQuantity("");
      setBuyingCost("");
      setError("");
      setSuccess("");
    }
  }, [open, eligibleProducts]);

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
    if (kind === "bought") {
      const cost = Number(buyingCost);
      if (isNaN(cost) || cost < 0) {
        setError("Enter the total buying cost");
        return;
      }
    }
    setLoading(true);
    try {
      await dispatch(
        addReceiptThunk({
          sessionId: session.id,
          payload: {
            product_id: productId,
            quantity: qty,
            kind,
            buying_cost: kind === "bought" ? Number(buyingCost) : undefined,
          },
        }),
      ).unwrap();
      setSuccess("Recorded");
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to record");
    } finally {
      setLoading(false);
    }
  };

  const title = kind === "produced" ? "Receive production" : "Receive bought goods";
  const description =
    kind === "produced"
      ? "Record the cook's output as it arrives. Quantities only — prices are admin-set."
      : "Record sodas, water, biscuits, etc. Enter the total buying cost so margin is exact.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
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
              {eligibleProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {eligibleProducts.length === 0 && (
              <p className="text-xs text-gray-500">
                No {kind === "produced" ? "produced" : "bought"} products defined yet.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity *</label>
            <Input type="number" min={0} step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>

          {kind === "bought" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Total buying cost (RWF) *</label>
              <Input type="number" min={0} step="any" value={buyingCost} onChange={(e) => setBuyingCost(e.target.value)} required />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || eligibleProducts.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Recording..." : "Record"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
