import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { UserRole } from "~/types/auth";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { fetchBranchesThunk } from "~/store/branchesSlice";
import {
  getShopReconciliation,
  getStoreVariance,
  getBuffetGap,
  getDailyPnL,
  getStoreIssues,
  type ShopReconciliation,
  type StoreVariance,
  type BuffetGapReport,
  type DailyPnL,
  type StoreIssuesReport,
} from "~/services/reconciliation";
import { formatCurrency } from "~/lib/utils";
import { exportReconciliationPDF } from "~/lib/export-utils";

type Tab = "shop" | "store" | "issues" | "buffet" | "pnl";

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export default function ReconciliationPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === UserRole.ADMIN;
  const branches = useAppSelector((s) => s.branches.items);
  const branchesLoaded = useAppSelector((s) => s.branches.loaded);

  const [tab, setTab] = useState<Tab>("shop");
  const [branchId, setBranchId] = useState<string>(""); // "" = all branches
  const [date, setDate] = useState(todayISO());
  const [from, setFrom] = useState(daysAgoISO(30));
  const [to, setTo] = useState(todayISO());

  const [shopData, setShopData] = useState<ShopReconciliation | null>(null);
  const [storeData, setStoreData] = useState<StoreVariance | null>(null);
  const [issuesData, setIssuesData] = useState<StoreIssuesReport | null>(null);
  const [buffetData, setBuffetData] = useState<BuffetGapReport | null>(null);
  const [pnlData, setPnlData] = useState<DailyPnL | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!branchesLoaded) dispatch(fetchBranchesThunk());
  }, [branchesLoaded, dispatch]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    let cancelled = false;
    const load = async () => {
      try {
        if (tab === "shop") {
          const r = await getShopReconciliation(date, branchId || undefined);
          if (!cancelled) setShopData(r);
        } else if (tab === "store") {
          const r = await getStoreVariance(from, to, branchId || undefined);
          if (!cancelled) setStoreData(r);
        } else if (tab === "issues") {
          const r = await getStoreIssues(from, to, branchId || undefined);
          if (!cancelled) setIssuesData(r);
        } else if (tab === "buffet") {
          const r = await getBuffetGap(date, branchId || undefined);
          if (!cancelled) setBuffetData(r);
        } else if (tab === "pnl") {
          const r = await getDailyPnL(date, branchId || undefined);
          if (!cancelled) setPnlData(r);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load report");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [tab, date, from, to, branchId, isAdmin]);

  const handleExport = () => {
    if (tab === "shop" && shopData) exportReconciliationPDF("shop", shopData);
    else if (tab === "store" && storeData) exportReconciliationPDF("store", storeData);
    else if (tab === "buffet" && buffetData) exportReconciliationPDF("buffet", buffetData);
    else if (tab === "pnl" && pnlData) exportReconciliationPDF("pnl", pnlData);
    // "issues" export is not wired to the PDF helper yet — kept in the table view.
  };

  if (!isAdmin) {
    return (
      <main className="wrapper flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">Access Denied: Admin Only</p>
      </main>
    );
  }

  const currentBranchLabel = useMemo(() => {
    if (!branchId) return "All branches";
    const b = branches.find((x) => String(x.id) === branchId);
    return b?.name || branchId;
  }, [branchId, branches]);

  const tabButton = (id: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6">
      <Header
        title="Reconciliation"
        description="Monitor each branch independently. Pick a branch above to drill in, or leave it on 'All branches' for a system-wide view."
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      {/* Branch selector — the primary control for cross-branch monitoring */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-end gap-3 justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[200px] bg-white"
            >
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name || b.id}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-xs text-gray-500 self-center">
          Viewing: <span className="font-semibold text-gray-800">{currentBranchLabel}</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200 flex gap-2 overflow-x-auto">
        {tabButton("shop", "Shop reconciliation")}
        {tabButton("store", "Store variance")}
        {tabButton("issues", "Store issues")}
        {tabButton("buffet", "Buffet gap")}
        {tabButton("pnl", "Daily P&L")}
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div className="flex flex-wrap items-end gap-3">
          {(tab === "store" || tab === "issues") ? (
            <>
              <div>
                <label className="text-xs text-gray-500 block mb-1">From</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">To</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          )}
        </div>
        {tab !== "issues" && (
          <Button variant="outline" onClick={handleExport} disabled={loading} className="gap-2">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error:</strong> <span>{error}</span>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading…</div>}

      {!loading && tab === "shop" && shopData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatBox label="Expected revenue" value={formatCurrency(shopData.totals.revenue_expected)} />
            <StatBox label="Actual cash" value={formatCurrency(shopData.totals.cash_actual)} />
            <StatBox
              label="Cash variance"
              value={formatCurrency(shopData.totals.cash_variance)}
              tone={shopData.totals.cash_variance < 0 ? "bad" : shopData.totals.cash_variance > 0 ? "good" : "neutral"}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatBox label="Bought cost (resold goods)" value={formatCurrency(shopData.totals.bought_cost)} tone="bad" />
            <StatBox label="Ingredient cost (produced items)" value={formatCurrency(shopData.totals.ingredient_cost)} tone="bad" />
            <StatBox
              label="Margin"
              value={formatCurrency(shopData.totals.margin)}
              tone={shopData.totals.margin >= 0 ? "good" : "bad"}
            />
          </div>
          <section className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
              <span>Per-product {shopData.branch_name ? `— ${shopData.branch_name}` : ""}</span>
              <span className="text-xs text-gray-400">
                Produced items use <b>ingredient cost</b> from issues/direct-use. Bought items use <b>buying cost</b> per unit.
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Opening</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Waste</TableHead>
                    <TableHead className="text-right">Closing</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Buying cost</TableHead>
                    <TableHead className="text-right">Ingredient cost</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopData.lines.map((l) => (
                    <TableRow key={l.product_name}>
                      <TableCell className="font-medium">{l.product_name}</TableCell>
                      <TableCell className="text-xs text-gray-500 capitalize">{l.source}</TableCell>
                      <TableCell className="text-right font-mono">{l.opening_qty}</TableCell>
                      <TableCell className="text-right font-mono">{l.received_qty}</TableCell>
                      <TableCell className="text-right font-mono">{l.waste_qty}</TableCell>
                      <TableCell className="text-right font-mono">{l.closing_qty}</TableCell>
                      <TableCell className="text-right font-mono">{l.sold_qty}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(l.revenue)}</TableCell>
                      <TableCell className="text-right font-mono">{l.buying_cost ? formatCurrency(l.buying_cost) : "—"}</TableCell>
                      <TableCell className="text-right font-mono">{l.ingredient_cost ? formatCurrency(l.ingredient_cost) : "—"}</TableCell>
                      <TableCell className={`text-right font-mono ${l.margin < 0 ? "text-red-600" : "text-green-700"}`}>
                        {formatCurrency(l.margin)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </>
      )}

      {!loading && tab === "store" && storeData && (
        <section className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 text-sm text-gray-500">
            Variances {storeData.branch_name ? `at ${storeData.branch_name}` : "across all branches"} between {storeData.from} and {storeData.to}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right"># of counts</TableHead>
                  <TableHead className="text-right">Avg variance</TableHead>
                  <TableHead className="text-right">Worst variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeData.items.map((i) => (
                  <TableRow key={i.item_name}>
                    <TableCell className="font-medium">{i.item_name}</TableCell>
                    <TableCell className="text-sm">{i.unit}</TableCell>
                    <TableCell className="text-right font-mono">{i.counts}</TableCell>
                    <TableCell className={`text-right font-mono ${i.avg_variance < 0 ? "text-red-600" : i.avg_variance > 0 ? "text-green-700" : ""}`}>
                      {i.avg_variance > 0 ? "+" : ""}{Number(i.avg_variance).toFixed(2)} {i.unit}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${i.worst_variance < 0 ? "text-red-600" : i.worst_variance > 0 ? "text-green-700" : ""}`}>
                      {i.worst_variance > 0 ? "+" : ""}{i.worst_variance} {i.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {!loading && tab === "issues" && issuesData && (
        <section className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 text-sm text-gray-500">
            Ingredients issued to the kitchen {issuesData.branch_name ? `at ${issuesData.branch_name}` : "across all branches"} between {issuesData.from} and {issuesData.to}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Issued by</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Intended product</TableHead>
                  <TableHead className="text-right">Unit cost</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issuesData.issues.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-gray-500 py-6">
                      No issues in this range.
                    </TableCell>
                  </TableRow>
                )}
                {issuesData.issues.flatMap((iss) =>
                  iss.lines.map((line, idx) => (
                    <TableRow key={`${iss.id}-${idx}`}>
                      <TableCell className="text-xs text-gray-500">{new Date(iss.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{iss.issued_by}</TableCell>
                      <TableCell className="font-medium">{line.item_name}</TableCell>
                      <TableCell className="text-right font-mono">{line.quantity} {line.unit}</TableCell>
                      <TableCell className="text-xs capitalize">{line.purpose}</TableCell>
                      <TableCell className="text-xs text-gray-500">{line.intended_product || "—"}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(line.unit_cost)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(line.total_cost)}</TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {!loading && tab === "buffet" && buffetData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatBox label="Plates served (all tiers)" value={String(buffetData.totals.plates_out)} />
            <StatBox label="Remaining" value={String(buffetData.totals.remaining)} />
            <StatBox label="Scans" value={String(buffetData.totals.scans)} />
            <StatBox label="Exceptions" value={String(buffetData.totals.exceptions)} />
            <StatBox
              label="Gap (plates)"
              value={String(buffetData.totals.gap_plates)}
              tone={buffetData.totals.gap_plates > 0 ? "bad" : "good"}
            />
            <StatBox
              label="Gap (RWF)"
              value={formatCurrency(buffetData.totals.gap_rwf)}
              tone={buffetData.totals.gap_rwf > 0 ? "bad" : "good"}
            />
          </div>

          {/* Per-tier scan aggregates */}
          <section className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
              <span>Per tier {buffetData.branch_name ? `— ${buffetData.branch_name}` : ""}</span>
              <span className="text-xs text-gray-400">
                A tier can share a shift with another (pooled plates). Plate gap is shown per shift below.
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Shifts covering</TableHead>
                    <TableHead className="text-right">Scans</TableHead>
                    <TableHead className="text-right">Exceptions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(buffetData.by_tier || []).map((t) => (
                    <TableRow key={t.meal_type}>
                      <TableCell className="font-semibold">{t.meal_type}</TableCell>
                      <TableCell className="text-right font-mono">{t.shifts_covering}</TableCell>
                      <TableCell className="text-right font-mono">{t.scans}</TableCell>
                      <TableCell className="text-right font-mono">{t.exceptions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 text-sm text-gray-500">
              Per shift {buffetData.branch_name ? `— ${buffetData.branch_name}` : ""}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift</TableHead>
                    <TableHead>Tiers</TableHead>
                    <TableHead>Scanner</TableHead>
                    <TableHead className="text-right">Plates served</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-right">Scans</TableHead>
                    <TableHead className="text-right">Exceptions</TableHead>
                    <TableHead className="text-right">Gap plates</TableHead>
                    <TableHead className="text-right">Gap RWF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buffetData.shifts.map((s) => (
                    <TableRow key={s.shift_id}>
                      <TableCell className="font-mono text-xs">{s.shift_id}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(s.meal_types || []).map((t) => (
                            <span key={t} className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-800 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{s.scanner_name}</TableCell>
                      <TableCell className="text-right font-mono">{s.plates_out}</TableCell>
                      <TableCell className="text-right font-mono">{s.remaining}</TableCell>
                      <TableCell className="text-right font-mono">{s.scans}</TableCell>
                      <TableCell className="text-right font-mono">{s.exceptions}</TableCell>
                      <TableCell className={`text-right font-mono ${s.gap_plates > 0 ? "text-red-600" : ""}`}>{s.gap_plates}</TableCell>
                      <TableCell className={`text-right font-mono ${s.gap_rwf > 0 ? "text-red-600" : ""}`}>{formatCurrency(s.gap_rwf)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </>
      )}

      {!loading && tab === "pnl" && pnlData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatBox label="Total income" value={formatCurrency(pnlData.total_income)} tone="good" />
            <StatBox label="Total cost" value={formatCurrency(pnlData.total_cost)} tone="bad" />
            <StatBox
              label="Margin"
              value={formatCurrency(pnlData.margin)}
              tone={pnlData.margin >= 0 ? "good" : "bad"}
            />
          </div>
          <section className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
              <span>Breakdown {pnlData.branch_name ? `— ${pnlData.branch_name}` : ""}</span>
              <span className="text-xs text-gray-400">
                Costs are split by destination so shop-production cost is visible separately from buffet cost.
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Line</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell className="text-green-700">Income</TableCell><TableCell>Shop revenue</TableCell><TableCell className="text-xs text-gray-500">—</TableCell><TableCell className="text-right font-mono">{formatCurrency(pnlData.income.shop_revenue)}</TableCell></TableRow>
                  <TableRow><TableCell className="text-green-700">Income</TableCell><TableCell>Buffet revenue</TableCell><TableCell className="text-xs text-gray-500">—</TableCell><TableCell className="text-right font-mono">{formatCurrency(pnlData.income.buffet_revenue)}</TableCell></TableRow>
                  <TableRow><TableCell className="text-red-600">Cost</TableCell><TableCell>Ingredients issued</TableCell><TableCell className="text-xs text-gray-500">Shop production</TableCell><TableCell className="text-right font-mono">{formatCurrency(pnlData.cost.ingredients_issued_shop)}</TableCell></TableRow>
                  <TableRow><TableCell className="text-red-600">Cost</TableCell><TableCell>Ingredients issued</TableCell><TableCell className="text-xs text-gray-500">Buffet</TableCell><TableCell className="text-right font-mono">{formatCurrency(pnlData.cost.ingredients_issued_buffet)}</TableCell></TableRow>
                  <TableRow><TableCell className="text-red-600">Cost</TableCell><TableCell>Direct-use purchases</TableCell><TableCell className="text-xs text-gray-500">Shop production</TableCell><TableCell className="text-right font-mono">{formatCurrency(pnlData.cost.direct_use_shop)}</TableCell></TableRow>
                  <TableRow><TableCell className="text-red-600">Cost</TableCell><TableCell>Direct-use purchases</TableCell><TableCell className="text-xs text-gray-500">Buffet</TableCell><TableCell className="text-right font-mono">{formatCurrency(pnlData.cost.direct_use_buffet)}</TableCell></TableRow>
                  <TableRow><TableCell className="text-red-600">Cost</TableCell><TableCell>Bought goods (resold)</TableCell><TableCell className="text-xs text-gray-500">Shop</TableCell><TableCell className="text-right font-mono">{formatCurrency(pnlData.cost.bought_goods)}</TableCell></TableRow>
                  <TableRow><TableCell className="text-red-600">Cost</TableCell><TableCell>Labor (salary, prorated)</TableCell><TableCell className="text-xs text-gray-500">Payroll</TableCell><TableCell className="text-right font-mono">{formatCurrency(pnlData.cost.labor_salary)}</TableCell></TableRow>
                  <TableRow><TableCell className="text-red-600">Cost</TableCell><TableCell>Waste</TableCell><TableCell className="text-xs text-gray-500">—</TableCell><TableCell className="text-right font-mono">{formatCurrency(pnlData.cost.waste_cost)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function StatBox({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "good" | "bad" | "neutral" }) {
  const color =
    tone === "good" ? "text-green-700"
    : tone === "bad" ? "text-red-600"
    : "text-gray-900";
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="text-gray-600 text-sm font-medium">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
