import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, PackageOpen, ClipboardCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { fetchStoreItemsThunk } from "~/store/storeSlice";
import { formatCurrency } from "~/lib/utils";
import { RecordPurchaseSheet } from "~/components/store/RecordPurchaseSheet";
import { IssueSheet } from "~/components/store/IssueSheet";

export default function StoreDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, loaded, error, recentPurchases, recentIssues, recentCounts } = useAppSelector((s) => s.store);

  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);

  useEffect(() => {
    if (!loaded) dispatch(fetchStoreItemsThunk());
  }, [dispatch, loaded]);

  const lowStock = useMemo(() => items.filter((i) => i.is_low_stock), [items]);
  const totalValue = useMemo(
    () => items.reduce((sum, i) => sum + (i.total_value || 0), 0),
    [items],
  );

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6">
      <Header
        title="Store"
        description="Track ingredients on hand, record purchases, issues, and physical counts."
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Failed to load store:</strong> <span>{error}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button onClick={() => setPurchaseOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Record purchase
        </Button>
        <Button onClick={() => setIssueOpen(true)} className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <PackageOpen className="h-4 w-4" /> Issue to kitchen
        </Button>
        <Button onClick={() => navigate("/store/count")} variant="outline" className="gap-2">
          <ClipboardCheck className="h-4 w-4" /> Physical count
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <span className="text-gray-600 font-medium">Current stock value</span>
          <span className="text-3xl font-bold text-gray-900">{formatCurrency(totalValue)}</span>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <TrendingUp className="h-4 w-4" /> across {items.length} tracked items
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <span className="text-gray-600 font-medium">Low-stock alerts</span>
          <span className="text-3xl font-bold text-red-600">{lowStock.length}</span>
          <div className="text-sm text-gray-500">items at or below their threshold</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <span className="text-gray-600 font-medium">Stocked vs direct-use</span>
          <span className="text-3xl font-bold text-gray-900">
            {items.filter((i) => i.valuation_mode === "stocked").length}
            <span className="text-gray-400 text-lg"> / {items.filter((i) => i.valuation_mode === "direct_use").length}</span>
          </span>
          <div className="text-sm text-gray-500">items on shelf / used same-day</div>
        </div>
      </div>

      {/* Low-stock list — pinned at top when non-empty */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <span className="font-semibold text-amber-900">Low stock</span>
          </div>
          <ul className="space-y-1 text-sm text-amber-900">
            {lowStock.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>{i.name}</span>
                <span className="font-mono">
                  {i.quantity_on_hand} {i.unit} <span className="text-amber-700">/ min {i.min_quantity}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Shelf table */}
      <section className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 text-sm text-gray-500">
          {loading && !loaded ? "Loading…" : `${items.length} items in store`}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">On hand</TableHead>
                <TableHead className="text-right">Avg unit cost</TableHead>
                <TableHead className="text-right">Total value</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && !loaded && (
                [1, 2, 3, 4].map((k) => (
                  <TableRow key={k}>
                    <TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell>
                  </TableRow>
                ))
              )}
              {loaded && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">
                    No items yet. Record a purchase to start.
                  </TableCell>
                </TableRow>
              )}
              {items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell className="text-sm">{i.unit}</TableCell>
                  <TableCell className="text-right font-mono">{i.quantity_on_hand}</TableCell>
                  <TableCell className="text-right font-mono">
                    {i.valuation_mode === "stocked" ? formatCurrency(i.avg_unit_cost) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {i.valuation_mode === "stocked" ? formatCurrency(i.total_value) : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{i.valuation_mode.replace("_", " ")}</TableCell>
                  <TableCell>
                    {i.is_low_stock ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Low</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">OK</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Recent activity — three parallel columns, most recent first. Populated
          from Redux state whenever the storekeeper records something. */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="font-semibold mb-3">Recent purchases</div>
          {recentPurchases.length === 0 ? (
            <p className="text-xs text-gray-500">No purchases recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentPurchases.slice(0, 5).map((p) => (
                <li key={p.id} className="flex justify-between gap-2 border-b border-gray-50 pb-1 last:border-0">
                  <span className="truncate">
                    {p.item_name}
                    <span className="text-xs text-gray-400 ml-1">
                      → {p.destination === "store" ? "store" : `direct-use (${p.direct_use_for})`}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-gray-600 shrink-0">
                    {p.quantity} {p.unit} · {formatCurrency(p.total_cost)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="font-semibold mb-3">Recent issues</div>
          {recentIssues.length === 0 ? (
            <p className="text-xs text-gray-500">No kitchen issues recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentIssues.slice(0, 5).map((iss) => {
                const totalCost = iss.lines.reduce((s, l) => s + (l.total_cost || 0), 0);
                const purposes = Array.from(new Set(iss.lines.map((l) => l.purpose))).join(", ");
                return (
                  <li key={iss.id} className="flex justify-between gap-2 border-b border-gray-50 pb-1 last:border-0">
                    <span className="truncate">
                      {iss.lines.length} line{iss.lines.length === 1 ? "" : "s"}
                      <span className="text-xs text-gray-400 ml-1">→ {purposes}</span>
                    </span>
                    <span className="font-mono text-xs text-gray-600 shrink-0">
                      {formatCurrency(totalCost)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="font-semibold mb-3">Recent counts</div>
          {recentCounts.length === 0 ? (
            <p className="text-xs text-gray-500">No physical counts recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentCounts.slice(0, 5).map((c) => {
                const shortages = c.entries.filter((e) => e.variance < 0).length;
                const overs = c.entries.filter((e) => e.variance > 0).length;
                return (
                  <li key={c.id} className="flex justify-between gap-2 border-b border-gray-50 pb-1 last:border-0">
                    <span>{c.entries.length} item{c.entries.length === 1 ? "" : "s"}</span>
                    <span className="text-xs shrink-0">
                      {shortages > 0 && <span className="text-red-600">−{shortages}</span>}
                      {shortages > 0 && overs > 0 && <span className="text-gray-400"> / </span>}
                      {overs > 0 && <span className="text-green-700">+{overs}</span>}
                      {shortages === 0 && overs === 0 && <span className="text-gray-500">no variance</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <RecordPurchaseSheet open={purchaseOpen} onOpenChange={setPurchaseOpen} />
      <IssueSheet open={issueOpen} onOpenChange={setIssueOpen} />
    </main>
  );
}
