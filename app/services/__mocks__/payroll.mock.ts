// In-memory stub for /payroll/* endpoints.
// Tracks workers, their monthly salaries, mid-month advances, and deductions
// (e.g. worker broke a dish and the cost comes out of their pay).
//
// End-of-month payout for a worker in period P = monthly_salary − advances(P) − deductions(P).
// Daily labor cost for a branch = SUM(active worker.monthly_salary) / days_in_period.

import type {
  PayrollWorker,
  PayrollAdvance,
  PayrollDeduction,
  WorkerPayload,
  AdvancePayload,
  DeductionPayload,
  PayrollSummary,
  PayrollSummaryRow,
} from "../payroll";

let _nextId = 1;
const uid = () => String(_nextId++);
const now = () => new Date().toISOString();

const _workers: PayrollWorker[] = [
  {
    id: uid(),
    full_name: "Alice Cook",
    phone: "0781000001",
    role: "Cook",
    branch_id: "cavm",
    monthly_salary: 150000,
    active: true,
    created_at: now(),
  },
  {
    id: uid(),
    full_name: "Bosco Assistant",
    phone: "0781000002",
    role: "Kitchen assistant",
    branch_id: "cavm",
    monthly_salary: 90000,
    active: true,
    created_at: now(),
  },
  {
    id: uid(),
    full_name: "Claire Baker",
    phone: "0781000003",
    role: "Baker",
    branch_id: "busogo",
    monthly_salary: 120000,
    active: true,
    created_at: now(),
  },
];

const _advances: PayrollAdvance[] = [];
const _deductions: PayrollDeduction[] = [];

const delay = <T,>(v: T, ms = 200): Promise<T> =>
  new Promise((res) => setTimeout(() => res(v), ms));

// Simple period matcher: item.created_at starts with "YYYY-MM"
const inPeriod = (createdAt: string, period: string) => createdAt.startsWith(period);

const daysInPeriod = (period: string): number => {
  // period is YYYY-MM
  const [y, m] = period.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};

// ---------- Workers ----------

export async function mockListWorkers(branchId?: string): Promise<PayrollWorker[]> {
  const list = _workers.filter((w) => !branchId || w.branch_id === branchId);
  return delay(list.map((w) => ({ ...w })));
}

export async function mockCreateWorker(payload: WorkerPayload): Promise<PayrollWorker> {
  const w: PayrollWorker = {
    id: uid(),
    full_name: payload.full_name,
    phone: payload.phone,
    role: payload.role,
    branch_id: payload.branch_id,
    monthly_salary: payload.monthly_salary,
    active: payload.active ?? true,
    created_at: now(),
  };
  _workers.push(w);
  return delay({ ...w });
}

export async function mockUpdateWorker(id: string, payload: Partial<WorkerPayload>): Promise<PayrollWorker> {
  const w = _workers.find((x) => x.id === id);
  if (!w) throw new Error("Worker not found");
  Object.assign(w, payload);
  return delay({ ...w });
}

export async function mockDeleteWorker(id: string): Promise<{ id: string }> {
  const idx = _workers.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("Worker not found");
  _workers.splice(idx, 1);
  return delay({ id });
}

// ---------- Advances ----------

export async function mockListAdvances(workerId: string, period?: string): Promise<PayrollAdvance[]> {
  const list = _advances.filter(
    (a) => a.worker_id === workerId && (!period || inPeriod(a.created_at, period)),
  );
  return delay(list.map((a) => ({ ...a })));
}

export async function mockRecordAdvance(workerId: string, payload: AdvancePayload): Promise<PayrollAdvance> {
  const w = _workers.find((x) => x.id === workerId);
  if (!w) throw new Error("Worker not found");
  const a: PayrollAdvance = {
    id: uid(),
    worker_id: workerId,
    worker_name: w.full_name,
    amount: payload.amount,
    reason: payload.reason || "",
    given_by: payload.given_by,
    created_at: now(),
  };
  _advances.unshift(a);
  return delay({ ...a });
}

// ---------- Deductions ----------

export async function mockListDeductions(workerId: string, period?: string): Promise<PayrollDeduction[]> {
  const list = _deductions.filter(
    (d) => d.worker_id === workerId && (!period || inPeriod(d.created_at, period)),
  );
  return delay(list.map((d) => ({ ...d })));
}

export async function mockRecordDeduction(workerId: string, payload: DeductionPayload): Promise<PayrollDeduction> {
  const w = _workers.find((x) => x.id === workerId);
  if (!w) throw new Error("Worker not found");
  const d: PayrollDeduction = {
    id: uid(),
    worker_id: workerId,
    worker_name: w.full_name,
    amount: payload.amount,
    reason: payload.reason,
    applied_by: payload.applied_by,
    created_at: now(),
  };
  _deductions.unshift(d);
  return delay({ ...d });
}

// ---------- Summary ----------

export async function mockGetPayrollSummary(period: string, branchId?: string): Promise<PayrollSummary> {
  const days = daysInPeriod(period);
  const workers = _workers.filter((w) => w.active && (!branchId || w.branch_id === branchId));

  const rows: PayrollSummaryRow[] = workers.map((w) => {
    const advances = _advances
      .filter((a) => a.worker_id === w.id && inPeriod(a.created_at, period))
      .reduce((s, a) => s + a.amount, 0);
    const deductions = _deductions
      .filter((d) => d.worker_id === w.id && inPeriod(d.created_at, period))
      .reduce((s, d) => s + d.amount, 0);
    const net_to_pay = w.monthly_salary - advances - deductions;
    return {
      worker_id: w.id,
      worker_name: w.full_name,
      role: w.role,
      branch_id: w.branch_id,
      monthly_salary: w.monthly_salary,
      daily_salary_cost: Number((w.monthly_salary / days).toFixed(2)),
      advances_total: advances,
      deductions_total: deductions,
      net_to_pay,
    };
  });

  const total_monthly = rows.reduce((s, r) => s + r.monthly_salary, 0);
  const total_advances = rows.reduce((s, r) => s + r.advances_total, 0);
  const total_deductions = rows.reduce((s, r) => s + r.deductions_total, 0);
  const total_daily_cost = Number((total_monthly / days).toFixed(2));

  return delay({
    period,
    branch_id: branchId,
    days_in_period: days,
    rows,
    totals: {
      workers: rows.length,
      monthly_salary: total_monthly,
      daily_salary_cost: total_daily_cost,
      advances: total_advances,
      deductions: total_deductions,
      net_to_pay: total_monthly - total_advances - total_deductions,
    },
  });
}

// Exposed for other reports (P&L) — daily labor cost for a branch or all.
export function _internalDailyLaborCost(period: string, branchId?: string): number {
  const days = daysInPeriod(period);
  return Number(
    (
      _workers
        .filter((w) => w.active && (!branchId || w.branch_id === branchId))
        .reduce((s, w) => s + w.monthly_salary, 0) / days
    ).toFixed(2),
  );
}
