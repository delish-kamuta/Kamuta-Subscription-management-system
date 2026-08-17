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
import {
  createProduct,
  updateProduct,
  getProductPriceHistory,
  type Product,
  type ProductSource,
  type ProductPriceHistoryEntry,
} from "~/services/products";
import { formatCurrency } from "~/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
  action: "Add" | "Edit" | "View";
  initialData?: Product | null;
};

// Only admin sets selling_price. Editing a price appends a price-history row;
// past sessions keep their old price — the UI notes that explicitly.
export function ProductSheet({ open, onOpenChange, onSuccess, action, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    source: "produced" as ProductSource,
    selling_price: 0,
    active: true,
  });
  const [priceHistory, setPriceHistory] = useState<ProductPriceHistoryEntry[]>([]);
  const [priceEdited, setPriceEdited] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          source: initialData.source,
          selling_price: initialData.selling_price,
          active: initialData.active,
        });
      } else {
        setFormData({ name: "", source: "produced", selling_price: 0, active: true });
      }
      setError("");
      setSuccess("");
      setPriceEdited(false);
    }
  }, [open, initialData]);

  useEffect(() => {
    if (open && initialData?.id) {
      getProductPriceHistory(initialData.id).then(setPriceHistory).catch(() => setPriceHistory([]));
    } else {
      setPriceHistory([]);
    }
  }, [open, initialData?.id]);

  const readOnly = action === "View";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (action === "Edit" && initialData?.id) {
        await updateProduct(initialData.id, formData);
        setSuccess("Product updated");
      } else {
        await createProduct(formData);
        setSuccess("Product created");
      }
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1200);
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>{action} product</SheetTitle>
          <SheetDescription>
            Products drive the shop session. Buying cost vs selling price shows the margin at a glance.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={readOnly}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Source *</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value as ProductSource })}
              disabled={readOnly}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="produced">Produced (cook's output — chapati, mandazi)</option>
              <option value="bought">Bought (sodas, water, biscuits)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Selling price (RWF) *</label>
            <Input
              type="number"
              min={0}
              step="any"
              value={formData.selling_price}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setPriceEdited(v !== (initialData?.selling_price ?? 0));
                setFormData({ ...formData, selling_price: v });
              }}
              disabled={readOnly}
              required
            />
            {priceEdited && action === "Edit" && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                This will not affect past sessions — the previous price is preserved in history.
              </p>
            )}
          </div>

          {!readOnly && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              Active — show in shop sessions
            </label>
          )}

          {action !== "Add" && priceHistory.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <div className="text-sm font-medium mb-2">Price history</div>
              <ul className="text-xs space-y-1">
                {priceHistory
                  .slice()
                  .sort((a, b) => (a.changed_at < b.changed_at ? 1 : -1))
                  .map((h) => (
                    <li key={h.id} className="flex justify-between text-gray-600">
                      <span>{new Date(h.changed_at).toLocaleString()}</span>
                      <span className="font-mono">{formatCurrency(h.selling_price)}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {readOnly ? "Close" : "Cancel"}
            </Button>
            {!readOnly && (
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? "Saving..." : action === "Edit" ? "Update" : "Create"}
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
