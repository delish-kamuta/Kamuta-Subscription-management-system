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
import { closeSessionThunk } from "~/store/shopSlice";
import { formatCurrency } from "~/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

// The two independent numbers per reconciliation:
//   (1) physical closing count per product  → drives EXPECTED revenue
//   (2) actual cash in the drawer            → compared to expected
// Cashier types both, server computes variance. Server also blocks with
// "missing delivery" if closing > opening + received for any product.
export function CloseSessionSheet({ open, onOpenChange }: Props) {
  const dispatch = useAppDispatch();
  const session = useAppSelector((s) => s.shop.currentSession);
  const user = useAppSelector((s) => s.auth.user);

  const [closings, setClosings] = useState<Record<string, string>>({});
  const [cashActual, setCashActual] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && session) {
      const initial: Record<string, string> = {};
      for (const l of session.lines) initial[l.product_id] = "";
      setClosings(initial);
      setCashActual("");
      setError("");
    }
  }, [open, session]);

  if (!session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Every line needs a closing count (0 is valid, empty is not).
    for (const l of session.lines) {
      if (closings[l.product_id] === "" || closings[l.product_id] === undefined) {
        setError(`Enter a closing count for ${l.product_name}`);
        return;
      }
      const v = Number(closings[l.product_id]);
      if (isNaN(v) || v < 0) {
        setError(`Closing count for ${l.product_name} must be 0 or more`);
        return;
      }
    }
    const cash = Number(cashActual);
    if (cashActual === "" || isNaN(cash) || cash < 0) {
      setError("Enter the actual cash in the drawer");
      return;
    }
    setLoading(true);
    try {
      await dispatch(
        closeSessionThunk({
          sessionId: session.id,
          payload: {
            closings: session.lines.map((l) => ({
              product_id: l.product_id,
              closing_qty: Number(closings[l.product_id]),
            })),
            cash_actual: cash,
          },
          closedBy: { id: user?.id, name: user?.name },
        }),
      ).unwrap();
      onOpenChange(false);
    } catch (err: any) {
      // Actionable message — server rejects with "missing delivery" text when
      // closing > available, propagate as-is.
      setError(err?.message || String(err) || "Failed to close session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto bg-white p-6 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Close today's session</SheetTitle>
          <SheetDescription>
            Count what's left of each product, then count the cash. The variance is calculated for you.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

          <div className="border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 text-right">Opening</th>
                  <th className="px-3 py-2 text-right">Received</th>
                  <th className="px-3 py-2 text-right">Waste</th>
                  <th className="px-3 py-2 text-right">Closing count *</th>
                </tr>
              </thead>
              <tbody>
                {session.lines.map((l) => {
                  const received = l.received_produced_qty + l.received_bought_qty;
                  return (
                    <tr key={l.product_id} className="border-t">
                      <td className="px-3 py-2 font-medium">{l.product_name}</td>
                      <td className="px-3 py-2 text-right font-mono">{l.opening_qty}</td>
                      <td className="px-3 py-2 text-right font-mono">{received}</td>
                      <td className="px-3 py-2 text-right font-mono">{l.waste_qty}</td>
                      <td className="px-3 py-2 text-right w-32">
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={closings[l.product_id] ?? ""}
                          onChange={(e) =>
                            setClosings((prev) => ({ ...prev, [l.product_id]: e.target.value }))
                          }
                          className="text-right"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Actual cash in the drawer (RWF) *</label>
            <Input type="number" min={0} step="any" value={cashActual} onChange={(e) => setCashActual(e.target.value)} required />
            <p className="text-xs text-gray-500">
              Count it independently — don't derive from the till. Displayed as expected {formatCurrency(0)} until close.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? "Closing..." : "Close session"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
