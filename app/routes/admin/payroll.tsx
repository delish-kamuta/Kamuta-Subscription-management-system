import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, HandCoins, MinusCircle, Trash2 } from "lucide-react";
import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { UserRole } from "~/types/auth";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import {
  fetchWorkersThunk,
  fetchPayrollSummaryThunk,
  deleteWorkerThunk,
} from "~/store/payrollSlice";
import { fetchBranchesThunk } from "~/store/branchesSlice";
import { formatCurrency } from "~/lib/utils";
import { WorkerSheet } from "~/components/payroll/WorkerSheet";
import { GiveAdvanceSheet } from "~/components/payroll/GiveAdvanceSheet";
import { ApplyDeductionSheet } from "~/components/payroll/ApplyDeductionSheet";
import type { PayrollWorker } from "~/services/payroll";

const thisPeriodISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function PayrollPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === UserRole.ADMIN;

  const branches = useAppSelector((s) => s.branches.items);
  const branchesLoaded = useAppSelector((s) => s.branches.loaded);
  const { workers, workersLoading, workersLoaded, summary, summaryLoading, error } = useAppSelector((s) => s.payroll);

  const [branchId, setBranchId] = useState<string>("");   // "" = all
  const [period, setPeriod] = useState<string>(thisPeriodISO());

  const [workerSheetOpen, setWorkerSheetOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<PayrollWorker | null>(null);
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [deductionOpen, setDeductionOpen] = useState(false);
  const [selectedForAction, setSelectedForAction] = useState<PayrollWorker | null>(null);

  useEffect(() => {
    if (!branchesLoaded) dispatch(fetchBranchesThunk());
  }, [branchesLoaded, dispatch]);

  useEffect(() => {
    if (!isAdmin) return;
    dispatch(fetchWorkersThunk({ branchId: branchId || undefined }));
    dispatch(fetchPayrollSummaryThunk({ period, branchId: branchId || undefined }));
  }, [dispatch, isAdmin, branchId, period]);

  const branchLabel = useMemo(() => {
    if (!branchId) return "All branches";
    return branches.find((b) => String(b.id) === branchId)?.name || branchId;
  }, [branchId, branches]);

  const refresh = () => {
    dispatch(fetchWorkersThunk({ branchId: branchId || undefined }));
    dispatch(fetchPayrollSummaryThunk({ period, branchId: branchId || undefined }));
  };

  const handleDelete = async (w: PayrollWorker) => {
    if (!confirm(`Remove ${w.full_name} from payroll? Advances and deductions history is preserved.`)) return;
    try {
      await dispatch(deleteWorkerThunk(w.id)).unwrap();
      refresh();
    } catch (e: any) {
      alert(e?.message || String(e));
    }
  };

  if (!isAdmin) {
    return (
      <main className="wrapper flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">Access Denied: Admin Only</p>
      </main>
    );
  }

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6">
      <Header
        title="Payroll"
        description="Track workers, salaries, mid-month advances, and deductions. Daily labor cost feeds the P&L."
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      {/* Filters */}
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
                <option key={b.id} value={String(b.id)}>{b.name || b.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Period</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedForEdit(null);
            setWorkerSheetOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" /> Add worker
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error:</strong> <span>{error}</span>
        </div>
      )}

      {/* Totals cards */}
      {summary && !summaryLoading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatBox label="Workers" value={String(summary.totals.workers)} />
          <StatBox label="Monthly salary" value={formatCurrency(summary.totals.monthly_salary)} />
          <StatBox label={`Daily cost (${summary.days_in_period} days)`} value={formatCurrency(summary.totals.daily_salary_cost)} />
          <StatBox label="Advances given" value={formatCurrency(summary.totals.advances)} tone="bad" />
          <StatBox label="Deductions applied" value={formatCurrency(summary.totals.deductions)} tone="bad" />
        </div>
      )}

      {/* Workers table with per-row actions */}
      <section className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            {workersLoading ? "Loading…" : `${workers.length} worker${workers.length === 1 ? "" : "s"}`}
            {branchId && <span className="text-gray-400"> · {branchLabel}</span>}
            <span className="text-gray-400"> · period {period}</span>
          </span>
          <span className="text-xs text-gray-400">
            Net to pay = monthly salary − advances − deductions
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Monthly salary</TableHead>
                <TableHead className="text-right">Daily cost</TableHead>
                <TableHead className="text-right">Advances</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net to pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!workersLoading && workers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-gray-500 py-6">
                    No workers yet. Click "Add worker" to start.
                  </TableCell>
                </TableRow>
              )}
              {workers.map((w) => {
                const row = summary?.rows.find((r) => r.worker_id === w.id);
                const branchName = branches.find((b) => String(b.id) === w.branch_id)?.name || w.branch_id;
                return (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div className="font-medium">{w.full_name}</div>
                      {w.phone && <div className="text-xs text-gray-500 font-mono">{w.phone}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{w.role}</TableCell>
                    <TableCell className="text-sm">{branchName}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(w.monthly_salary)}</TableCell>
                    <TableCell className="text-right font-mono text-gray-600">
                      {row ? formatCurrency(row.daily_salary_cost) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-amber-700">
                      {row && row.advances_total > 0 ? formatCurrency(row.advances_total) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      {row && row.deductions_total > 0 ? formatCurrency(row.deductions_total) : "—"}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-semibold ${(row?.net_to_pay ?? w.monthly_salary) < 0 ? "text-red-600" : "text-green-700"}`}>
                      {formatCurrency(row?.net_to_pay ?? w.monthly_salary)}
                    </TableCell>
                    <TableCell>
                      {w.active ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-amber-700 hover:text-amber-800"
                          onClick={() => { setSelectedForAction(w); setAdvanceOpen(true); }}
                          title="Give advance"
                        >
                          <HandCoins className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-red-600 hover:text-red-700"
                          onClick={() => { setSelectedForAction(w); setDeductionOpen(true); }}
                          title="Apply deduction"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedForEdit(w); setWorkerSheetOpen(true); }}
                          title="Edit worker"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(w)}
                          title="Remove worker"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <WorkerSheet
        open={workerSheetOpen}
        onOpenChange={setWorkerSheetOpen}
        initialData={selectedForEdit}
        onSuccess={refresh}
      />
      <GiveAdvanceSheet
        open={advanceOpen}
        onOpenChange={setAdvanceOpen}
        worker={selectedForAction}
        onSuccess={refresh}
      />
      <ApplyDeductionSheet
        open={deductionOpen}
        onOpenChange={setDeductionOpen}
        worker={selectedForAction}
        onSuccess={refresh}
      />
    </main>
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
