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
import { createYieldStandard, updateYieldStandard, type YieldStandard } from "~/services/yieldStandards";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
  initialData?: YieldStandard | null;
};

export function YieldStandardSheet({ open, onOpenChange, onSuccess, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    input_item_id: "",
    input_item_name: "",
    input_qty: 0,
    input_unit: "kg",
    output_qty: 0,
    tolerance_pct: 10,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          product_id: initialData.product_id,
          product_name: initialData.product_name,
          input_item_id: initialData.input_item_id,
          input_item_name: initialData.input_item_name,
          input_qty: initialData.input_qty,
          input_unit: initialData.input_unit,
          output_qty: initialData.output_qty,
          tolerance_pct: initialData.tolerance_pct,
        });
      } else {
        setFormData({
          product_id: "",
          product_name: "",
          input_item_id: "",
          input_item_name: "",
          input_qty: 0,
          input_unit: "kg",
          output_qty: 0,
          tolerance_pct: 10,
        });
      }
      setError("");
      setSuccess("");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (initialData?.id) {
        await updateYieldStandard(initialData.id, formData);
        setSuccess("Standard updated");
      } else {
        await createYieldStandard(formData);
        setSuccess("Standard created");
      }
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        setSuccess("");
      }, 1200);
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to save standard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6">
        <SheetHeader>
          <SheetTitle>{initialData ? "Edit standard" : "Add yield standard"}</SheetTitle>
          <SheetDescription>
            One input quantity should produce this many output units, ± tolerance.
            e.g. 5 kg flour → 120 chapati ±10%.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product name *</label>
              <Input
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                required
                placeholder="Chapati"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Product ID</label>
              <Input
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                placeholder="optional link"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input item name *</label>
              <Input
                value={formData.input_item_name}
                onChange={(e) => setFormData({ ...formData, input_item_name: e.target.value })}
                required
                placeholder="Wheat Flour"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Input item ID</label>
              <Input
                value={formData.input_item_id}
                onChange={(e) => setFormData({ ...formData, input_item_id: e.target.value })}
                placeholder="optional link"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input qty *</label>
              <Input
                type="number"
                min={0}
                step="any"
                value={formData.input_qty}
                onChange={(e) => setFormData({ ...formData, input_qty: Number(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Input unit *</label>
              <Input
                value={formData.input_unit}
                onChange={(e) => setFormData({ ...formData, input_unit: e.target.value })}
                required
                placeholder="kg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Output qty *</label>
              <Input
                type="number"
                min={0}
                step="any"
                value={formData.output_qty}
                onChange={(e) => setFormData({ ...formData, output_qty: Number(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tolerance (± %) *</label>
            <Input
              type="number"
              min={0}
              max={100}
              step="any"
              value={formData.tolerance_pct}
              onChange={(e) => setFormData({ ...formData, tolerance_pct: Number(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
