import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { fetchStoreItemsThunk, recordCountThunk } from "~/store/storeSlice";
import type { CountEntry } from "~/services/store";

type Row = {
  item_id: string;
  actual: string;
  reason: string;
};

export default function StoreCountPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loaded, loading } = useAppSelector((s) => s.store);

  const stocked = useMemo(() => items.filter((i) => i.valuation_mode === "stocked"), [items]);

  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedEntries, setSavedEntries] = useState<CountEntry[] | null>(null);

  useEffect(() => {
    if (!loaded) dispatch(fetchStoreItemsThunk());
  }, [dispatch, loaded]);

  useEffect(() => {
    // Prime the rows once items are loaded (only stocked items appear in the count sheet).
    setRows(stocked.map((i) => ({ item_id: i.id, actual: "", reason: "" })));
  }, [stocked.length, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const setRow = (item_id: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.item_id === item_id ? { ...r, ...patch } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSavedEntries(null);
    try {
      const entries = rows
        .filter((r) => r.actual !== "")
        .map((r) => ({
          item_id: r.item_id,
          actual_qty: Number(r.actual),
          reason: r.reason.trim() || undefined,
        }));
      if (entries.length === 0) {
        setError("Enter at least one counted quantity before saving");
        setSaving(false);
        return;
      }
      const result = await dispatch(recordCountThunk({ entries })).unwrap();
      setSavedEntries(result.entries);
      // Reset the input side; the shelf now reflects the counted values.
      setRows(stocked.map((i) => ({ item_id: i.id, actual: "", reason: "" })));
    } catch (err: any) {
      setError(err?.message || String(err) || "Failed to record count");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6">
      <Header
        title="Physical count"
        description="Count what's actually on the shelf. Variances are recorded, and the system quantity is reset to the counted value."
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/store")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Button>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <ClipboardCheck className="h-4 w-4" />
          {saving ? "Saving..." : "Save count"}
        </Button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

      {savedEntries && savedEntries.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
          <div className="font-semibold mb-3">Variances recorded</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">System</TableHead>
                <TableHead className="text-right">Counted</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedEntries.map((e) => (
                <TableRow key={e.item_id}>
                  <TableCell className="font-medium">{e.item_name}</TableCell>
                  <TableCell className="text-right font-mono">{e.system_qty} {e.unit}</TableCell>
                  <TableCell className="text-right font-mono">{e.actual_qty} {e.unit}</TableCell>
                  <TableCell className={`text-right font-mono ${e.variance < 0 ? "text-red-600" : e.variance > 0 ? "text-green-700" : "text-gray-500"}`}>
                    {e.variance > 0 ? "+" : ""}{e.variance} {e.unit}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{e.reason || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <section className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 text-sm text-gray-500">
          {stocked.length} stocked items to count (direct-use items are excluded)
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">System qty</TableHead>
                <TableHead className="text-right">Counted qty</TableHead>
                <TableHead>Reason (optional)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocked.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-6">
                    No stocked items yet.
                  </TableCell>
                </TableRow>
              )}
              {stocked.map((i) => {
                const row = rows.find((r) => r.item_id === i.id);
                return (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell className="text-sm">{i.unit}</TableCell>
                    <TableCell className="text-right font-mono">{i.quantity_on_hand}</TableCell>
                    <TableCell className="w-32">
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={row?.actual ?? ""}
                        onChange={(e) => setRow(i.id, { actual: e.target.value })}
                        placeholder="—"
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell className="w-64">
                      <Input
                        value={row?.reason ?? ""}
                        onChange={(e) => setRow(i.id, { reason: e.target.value })}
                        placeholder="e.g. spillage, spoilage"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </main>
  );
}
