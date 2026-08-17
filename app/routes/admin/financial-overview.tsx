import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Trophy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { UserRole } from "~/types/auth";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { fetchBranchesThunk } from "~/store/branchesSlice";
import {
  getLedger,
  getProductProfitability,
  getBranchProfitability,
  type LedgerEntry,
  type LedgerCategory,
  type LedgerDirection,
  type LedgerResponse,
  type ProductProfitability,
  type BranchProfitability,
} from "~/services/financial";
import { formatCurrency, exportToCsv } from "~/lib/utils";

type Tab = "ledger" | "products" | "branches";

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const CATEGORY_LABELS: Record<LedgerCategory, string> = {
  subscription:    "Subscriptions",
  shop_sale:       "Shop sales",
  buffet_meal:     "Buffet meals",
  irregular_ticket:"Walk-in tickets",
  order_earned:    "Event orders (earned)",
  purchase:        "Store purchases",
  direct_use:      "Direct-use purchases",
  waste:           "Waste",
  labor:           "Labor",
  advance:         "Advances",
  deduction:       "Deductions (recovery)",
};
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as LedgerCategory[];

export default function FinancialOverviewPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === UserRole.ADMIN;
  const branches = useAppSelector((s) => s.branches.items);
  const branchesLoaded = useAppSelector((s) => s.branches.loaded);

  const [tab, setTab] = useState<Tab>("ledger");
  const [from, setFrom] = useState(daysAgoISO(29));
  const [to, setTo] = useState(todayISO());
  const [branchId, setBranchId] = useState("");
  const [direction, setDirection] = useState<LedgerDirection | "both">("both");
  const [categories, setCategories] = useState<Set<LedgerCategory>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [ledger, setLedger] = useState<LedgerResponse | null>(null);
  const [products, setProducts] = useState<ProductProfitability[]>([]);
  const [branchesData, setBranchesData] = useState<BranchProfitability[]>([]);
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
        if (tab === "ledger") {
          const r = await getLedger({
            from,
            to,
            branch_id: branchId || undefined,
            direction,
            categories: categories.size > 0 ? Array.from(categories) : undefined,
            page,
            limit: pageSize,
          });
          if (!cancelled) setLedger(r);
        } else if (tab === "products") {
          const r = await getProductProfitability({ from, to, branch_id: branchId || undefined });
          if (!cancelled) setProducts(r);
        } else if (tab === "branches") {
          const r = await getBranchProfitability({ from, to });
          if (!cancelled) setBranchesData(r);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load financial data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [tab, from, to, branchId, direction, categories, page, isAdmin]);

  // Reset to page 1 whenever filters change (page itself is excluded from the deps that reset).
  useEffect(() => {
    setPage(1);
  }, [tab, from, to, branchId, direction, categories]);

  if (!isAdmin) {
    return (
      <main className="wrapper flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">Access Denied: Admin Only</p>
      </main>
    );
  }

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

  const toggleCategory = (c: LedgerCategory) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const clearCategoryFilter = () => setCategories(new Set());

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6">
      <Header
        title="Financial Overview"
        description="Every income, every expense, and what's actually profitable across the business."
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      {/* Date + branch filters shared across tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        {tab !== "branches" && (
          <div>
            <label className="text-xs text-gray-500 block mb-1">Branch</label>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[180px] bg-white">
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)}>{b.name || b.id}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200 flex gap-2 overflow-x-auto">
        {tabButton("ledger", "Ledger")}
        {tabButton("products", "Profitability by product")}
        {tabButton("branches", "Profitability by branch")}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error:</strong> <span>{error}</span>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading…</div>}

      {/* ==================== LEDGER ==================== */}
      {!loading && tab === "ledger" && ledger && (
        <LedgerTab
          data={ledger}
          direction={direction}
          setDirection={setDirection}
          categories={categories}
          toggleCategory={toggleCategory}
          clearCategoryFilter={clearCategoryFilter}
          page={page}
          setPage={setPage}
        />
      )}

      {/* ==================== PRODUCTS ==================== */}
      {!loading && tab === "products" && products.length > 0 && (
        <ProductsTab products={products} />
      )}

      {/* ==================== BRANCHES ==================== */}
      {!loading && tab === "branches" && branchesData.length > 0 && (
        <BranchesTab branches={branchesData} />
      )}
    </main>
  );
}

// ==================== Ledger tab ====================

function LedgerTab({
  data,
  direction,
  setDirection,
  categories,
  toggleCategory,
  clearCategoryFilter,
  page,
  setPage,
}: {
  data: LedgerResponse;
  direction: LedgerDirection | "both";
  setDirection: (d: LedgerDirection | "both") => void;
  categories: Set<LedgerCategory>;
  toggleCategory: (c: LedgerCategory) => void;
  clearCategoryFilter: () => void;
  page: number;
  setPage: (p: number) => void;
}) {
  const handleExport = () => {
    // Export the CURRENT page's rows. If the user wants everything, they can
    // set limit higher via a separate action; keep this simple for now.
    const headers = ["Date", "Direction", "Category", "Subcategory", "Description", "Branch", "Amount (RWF)", "Running balance (RWF)"];
    const rows = data.entries.map((e) => [
      e.date,
      e.direction === "in" ? "IN" : "OUT",
      CATEGORY_LABELS[e.category as LedgerCategory] ?? e.category,
      e.subcategory ?? "",
      e.description,
      e.branch_name ?? e.branch_id ?? "",
      e.amount,
      e.running_balance ?? "",
    ]);
    exportToCsv(headers, rows, "financial_ledger");
  };

  return (
    <>
      {/* Direction + category filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 text-xs">
            {(["both", "in", "out"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                className={`px-3 py-1.5 rounded-md border ${
                  direction === d
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {d === "both" ? "All" : d === "in" ? "Income only" : "Expenses only"}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" /> Export CSV (this page)
          </Button>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>Categories</span>
            {categories.size > 0 && (
              <button type="button" onClick={clearCategoryFilter} className="text-blue-600 hover:underline">
                clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 text-xs">
            {ALL_CATEGORIES.map((c) => {
              const on = categories.has(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`px-2 py-1 rounded border ${
                    on
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Totals strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Total income" value={formatCurrency(data.totals.total_income)} tone="good" />
        <StatBox label="Total expense" value={formatCurrency(data.totals.total_expense)} tone="bad" />
        <StatBox
          label="Net"
          value={formatCurrency(data.totals.net)}
          tone={data.totals.net >= 0 ? "good" : "bad"}
        />
        <StatBox label="Transactions" value={data.totals.transactions.toLocaleString()} />
      </div>

      {/* Ledger table */}
      <section className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 text-sm text-gray-500">
          {data.entries.length === 0 ? "No entries in this range" : `Showing ${data.entries.length} of ${data.totals.transactions}`}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Dir</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap">{e.date}</TableCell>
                  <TableCell className="text-center">
                    {e.direction === "in" ? (
                      <ArrowUpRight className="inline w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="inline w-4 h-4 text-red-600" />
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium">{CATEGORY_LABELS[e.category as LedgerCategory] ?? e.category}</div>
                    {e.subcategory && <div className="text-gray-500">{e.subcategory}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{e.description}</TableCell>
                  <TableCell className="text-xs text-gray-500">{e.branch_name ?? "—"}</TableCell>
                  <TableCell className={`text-right font-mono ${e.direction === "in" ? "text-green-700" : "text-red-600"}`}>
                    {e.direction === "in" ? "+" : "−"}{formatCurrency(e.amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-gray-600 whitespace-nowrap">
                    {e.running_balance != null ? formatCurrency(e.running_balance) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
            ← Previous
          </Button>
          <span className="text-xs text-gray-500">
            Page {data.page} of {data.total_pages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(Math.min(data.total_pages, page + 1))} disabled={page >= data.total_pages}>
            Next →
          </Button>
        </div>
      </section>
    </>
  );
}

// ==================== Products tab ====================

type ProductSort = "margin_pct" | "margin" | "revenue" | "cost" | "units_sold" | "product_name";

function ProductsTab({ products }: { products: ProductProfitability[] }) {
  const [sortKey, setSortKey] = useState<ProductSort>("margin_pct");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const arr = [...products];
    arr.sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [products, sortKey, sortDir]);

  const clickHeader = (key: ProductSort) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "product_name" ? "asc" : "desc");
    }
  };

  const marginColor = (pct: number) =>
    pct < 0 ? "text-red-600" : pct < 10 ? "text-amber-600" : "text-green-700";

  const sortIndicator = (key: ProductSort) =>
    sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <>
      <div className="text-xs text-gray-500 px-1">
        Default sort is <b>Margin %</b> ascending — the dogs bubble to the top.
        Click any column header to change sort.
      </div>
      <section className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => clickHeader("product_name")}>
                  Product{sortIndicator("product_name")}
                </TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => clickHeader("units_sold")}>
                  Units sold{sortIndicator("units_sold")}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => clickHeader("revenue")}>
                  Revenue{sortIndicator("revenue")}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => clickHeader("cost")}>
                  Cost{sortIndicator("cost")}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => clickHeader("margin")}>
                  Margin{sortIndicator("margin")}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => clickHeader("margin_pct")}>
                  Margin %{sortIndicator("margin_pct")}
                </TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p) => (
                <TableRow key={p.product_id}>
                  <TableCell className="font-medium">{p.product_name}</TableCell>
                  <TableCell className="text-xs capitalize text-gray-500">{p.source}</TableCell>
                  <TableCell className="text-right font-mono">{p.units_sold.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(p.revenue)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(p.cost)}</TableCell>
                  <TableCell className={`text-right font-mono ${marginColor(p.margin_pct)}`}>
                    {formatCurrency(p.margin)}
                  </TableCell>
                  <TableCell className={`text-right font-mono font-semibold ${marginColor(p.margin_pct)}`}>
                    {p.margin_pct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="w-32">
                    <div className="h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={p.daily}>
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#2563eb"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}

// ==================== Branches tab ====================

function BranchesTab({ branches }: { branches: BranchProfitability[] }) {
  const chartData = branches.map((b) => ({
    name: b.branch_name,
    Revenue: b.revenue,
    Cost: b.cost,
    Margin: b.margin,
  }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {branches.map((b, idx) => {
          const revenueDelta = b.vs_previous?.revenue_delta_pct ?? 0;
          const marginDelta = b.vs_previous?.margin_delta_pct ?? 0;
          const rankColor =
            idx === 0 ? "bg-yellow-100 text-yellow-800"
            : idx === 1 ? "bg-gray-200 text-gray-700"
            : idx === 2 ? "bg-orange-100 text-orange-800"
            : "bg-gray-50 text-gray-500";
          return (
            <div key={b.branch_id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{b.branch_name}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${rankColor}`}>
                  {idx < 3 && <Trophy className="w-3 h-3" />}
                  #{idx + 1}
                </span>
              </div>
              <div className="text-xs text-gray-500">Revenue</div>
              <div className="font-mono font-semibold text-green-700">{formatCurrency(b.revenue)}</div>
              <div className="text-xs text-gray-500">Cost</div>
              <div className="font-mono text-red-600">{formatCurrency(b.cost)}</div>
              <div className="border-t border-gray-100 pt-2 mt-1">
                <div className="text-xs text-gray-500">Margin</div>
                <div className={`font-mono font-bold text-lg ${b.margin >= 0 ? "text-green-700" : "text-red-600"}`}>
                  {formatCurrency(b.margin)}
                </div>
                <div className={`text-xs font-medium ${b.margin_pct >= 0 ? "text-green-700" : "text-red-600"}`}>
                  {b.margin_pct.toFixed(1)}%
                </div>
              </div>
              {b.vs_previous && (
                <div className="text-xs text-gray-500 pt-1 border-t border-gray-100 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span>Revenue vs previous:</span>
                    <span className={revenueDelta >= 0 ? "text-green-700" : "text-red-600"}>
                      {revenueDelta >= 0 ? "+" : ""}{revenueDelta}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Margin vs previous:</span>
                    <span className={marginDelta >= 0 ? "text-green-700" : "text-red-600"}>
                      {marginDelta >= 0 ? "+" : ""}{marginDelta}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <section className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-sm font-semibold mb-2">Revenue vs Cost per branch</div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
                cursor={{ fill: "#f3f4f6" }}
              />
              <Legend />
              <Bar dataKey="Revenue" fill="#16a34a" />
              <Bar dataKey="Cost" fill="#dc2626" />
              <Bar dataKey="Margin" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}

function StatBox({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "good" | "bad" | "neutral" }) {
  const color =
    tone === "good" ? "text-green-700"
    : tone === "bad" ? "text-red-600"
    : "text-gray-900";
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <div className="text-gray-600 text-xs font-medium">{label}</div>
      <div className={`text-xl md:text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
