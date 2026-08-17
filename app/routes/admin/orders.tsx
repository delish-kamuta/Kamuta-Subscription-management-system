import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, CircleCheck } from "lucide-react";
import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { UserRole } from "~/types/auth";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { fetchBranchesThunk } from "~/store/branchesSlice";
import {
  fetchOrdersThunk,
  fetchOrdersSummaryThunk,
  markOrderPaidThunk,
  deleteOrderThunk,
} from "~/store/ordersSlice";
import type { Order, OrderCustomerType, OrderPaymentStatus } from "~/services/orders";
import { formatCurrency } from "~/lib/utils";
import { OrderSheet } from "~/components/orders/OrderSheet";

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const canAccess =
    user?.role === UserRole.ADMIN || user?.role === UserRole.CASHIER;

  const branches = useAppSelector((s) => s.branches.items);
  const branchesLoaded = useAppSelector((s) => s.branches.loaded);
  const { items, loading, summary } = useAppSelector((s) => s.orders);
  const error = useAppSelector((s) => s.orders.error);

  const [from, setFrom] = useState(daysAgoISO(29));
  const [to, setTo] = useState(todayISO());
  const [branchId, setBranchId] = useState("");
  const [customerType, setCustomerType] = useState<OrderCustomerType | "all">("all");
  const [status, setStatus] = useState<OrderPaymentStatus | "all">("all");
  const [outstandingOnly, setOutstandingOnly] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (!branchesLoaded) dispatch(fetchBranchesThunk());
  }, [branchesLoaded, dispatch]);

  const effectiveStatus = outstandingOnly ? "outstanding" : status;

  useEffect(() => {
    if (!canAccess) return;
    dispatch(
      fetchOrdersThunk({
        from,
        to,
        branch_id: branchId || undefined,
        customer_type: customerType,
        status: effectiveStatus,
      }),
    );
    dispatch(
      fetchOrdersSummaryThunk({
        from,
        to,
        branch_id: branchId || undefined,
      }),
    );
  }, [dispatch, canAccess, from, to, branchId, customerType, effectiveStatus]);

  const refresh = () => {
    dispatch(
      fetchOrdersThunk({
        from,
        to,
        branch_id: branchId || undefined,
        customer_type: customerType,
        status: effectiveStatus,
      }),
    );
    dispatch(
      fetchOrdersSummaryThunk({
        from,
        to,
        branch_id: branchId || undefined,
      }),
    );
  };

  const handleMarkPaid = async (order: Order) => {
    if (!confirm(`Mark "${order.customer_name}" as paid today?`)) return;
    try {
      await dispatch(markOrderPaidThunk({ id: order.id })).unwrap();
      refresh();
    } catch (e: any) {
      alert(e?.message || String(e));
    }
  };

  const handleDelete = async (order: Order) => {
    if (!confirm(`Delete order "${order.customer_name}"? This cannot be undone.`)) return;
    try {
      await dispatch(deleteOrderThunk(order.id)).unwrap();
      refresh();
    } catch (e: any) {
      alert(e?.message || String(e));
    }
  };

  const branchLabel = useMemo(() => {
    if (!branchId) return "All branches";
    return branches.find((b) => String(b.id) === branchId)?.name || branchId;
  }, [branchId, branches]);

  if (!canAccess) {
    return (
      <main className="wrapper flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">Access Denied</p>
      </main>
    );
  }

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6">
      <Header
        title="Event Orders"
        description="Food orders from student groups and the campus. Track what's cooked, what's owed, and what's been paid."
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      {/* Filters + New order */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-end gap-3 justify-between">
        <div className="flex flex-wrap items-end gap-3">
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
          <div>
            <label className="text-xs text-gray-500 block mb-1">Branch</label>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[160px] bg-white">
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)}>{b.name || b.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Customer</label>
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value as OrderCustomerType | "all")}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">All types</option>
              <option value="student">Student</option>
              <option value="campus">Campus</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderPaymentStatus | "all")}
              disabled={outstandingOnly}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white disabled:opacity-50"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="outstanding">Outstanding</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setOutstandingOnly((v) => !v)}
            className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
              outstandingOnly
                ? "bg-amber-600 text-white border-amber-600"
                : "border-amber-300 text-amber-700 hover:bg-amber-50"
            }`}
          >
            💰 Money owed only
          </button>
        </div>
        <Button
          onClick={() => { setSelected(null); setSheetOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" /> New order
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error:</strong> <span>{error}</span>
        </div>
      )}

      {/* Totals cards — earned vs collected split matters for slow-paying campus */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            label="Earned in period"
            hint="Value of orders delivered in the range (event date)."
            value={formatCurrency(summary.earned_in_period)}
            tone="good"
          />
          <StatBox
            label="Collected in period"
            hint="Cash actually received (paid date). Slow-paying campus can trail earned."
            value={formatCurrency(summary.collected_in_period)}
            tone="good"
          />
          <StatBox
            label="Outstanding (all-time)"
            hint="Money we're owed — every unpaid order regardless of date."
            value={formatCurrency(summary.outstanding_total)}
            tone={summary.outstanding_total > 0 ? "bad" : "neutral"}
          />
          <StatBox label="Orders (filtered)" value={String(summary.count)} />
        </div>
      )}

      {/* Table */}
      <section className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            {loading ? "Loading…" : `${items.length} order${items.length === 1 ? "" : "s"}`}
            {branchId && <span className="text-gray-400"> · {branchLabel}</span>}
          </span>
          <span className="text-xs text-gray-400">
            Cost = direct ingredients + portion-share of shared buffet cost
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Portions</TableHead>
                <TableHead className="text-right">Agreed price</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-sm text-gray-500 py-6">
                    No orders in this range — create one to record income from student
                    groups or campus events.
                  </TableCell>
                </TableRow>
              )}
              {items.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="whitespace-nowrap font-mono text-xs">{o.event_date}</TableCell>
                  <TableCell>
                    <div className="font-medium">{o.customer_name}</div>
                    {o.notes && <div className="text-xs text-gray-500 truncate max-w-[220px]">{o.notes}</div>}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      o.customer_type === "student"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {o.customer_type === "student" ? "Student" : "Campus"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{o.branch_name || o.branch_id}</TableCell>
                  <TableCell className="text-right font-mono">{o.portions}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(o.agreed_price)}</TableCell>
                  <TableCell className="text-right font-mono text-gray-600">
                    <div>{formatCurrency(o.computed_cost)}</div>
                    <div className="text-xs text-gray-400">
                      {formatCurrency(o.direct_ingredients_cost)} + {formatCurrency(o.shared_cost_share)}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-mono font-semibold ${
                    o.margin < 0 ? "text-red-600" : "text-green-700"
                  }`}>
                    {formatCurrency(o.margin)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      o.payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {o.payment_status === "paid" ? "Paid" : "Outstanding"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                    {o.paid_date ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {o.payment_status === "outstanding" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-green-700 hover:text-green-800"
                          onClick={() => handleMarkPaid(o)}
                          title="Mark paid"
                        >
                          <CircleCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelected(o); setSheetOpen(true); }}
                        title="Edit order"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(o)}
                        title="Delete order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <OrderSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={selected}
        onSuccess={refresh}
      />
    </main>
  );
}

function StatBox({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const color =
    tone === "good" ? "text-green-700"
    : tone === "bad" ? "text-red-600"
    : "text-gray-900";
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100" title={hint}>
      <div className="text-gray-600 text-xs font-medium">{label}</div>
      <div className={`text-xl md:text-2xl font-bold mt-1 ${color}`}>{value}</div>
      {hint && <div className="text-[10px] text-gray-400 mt-1 leading-tight">{hint}</div>}
    </div>
  );
}
