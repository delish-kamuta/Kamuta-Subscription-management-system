import { apiClient } from "~/lib/api";
import {
  mockListWorkers,
  mockCreateWorker,
  mockUpdateWorker,
  mockDeleteWorker,
  mockListAdvances,
  mockRecordAdvance,
  mockListDeductions,
  mockRecordDeduction,
  mockGetPayrollSummary,
} from "./__mocks__/payroll.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCK_STORE === "true";

// ---------- Types ----------

export interface PayrollWorker {
  id: string;
  full_name: string;
  phone?: string;
  role: string;               // free-text position (Cook, Kitchen assistant, Baker…)
  branch_id: string;
  monthly_salary: number;     // gross monthly salary in RWF
  active: boolean;
  created_at: string;
}

export interface PayrollAdvance {
  id: string;
  worker_id: string;
  worker_name?: string;
  amount: number;
  reason?: string;            // "urgent — hospital bill", "school fees"…
  given_by?: string;          // user_id of the admin/cashier
  created_at: string;
}

export interface PayrollDeduction {
  id: string;
  worker_id: string;
  worker_name?: string;
  amount: number;
  reason: string;             // "broke serving dish", "late 3 times"…
  applied_by?: string;
  created_at: string;
}

export type WorkerPayload = {
  full_name: string;
  phone?: string;
  role: string;
  branch_id: string;
  monthly_salary: number;
  active?: boolean;
};

export type AdvancePayload = {
  amount: number;
  reason?: string;
  given_by?: string;
};

export type DeductionPayload = {
  amount: number;
  reason: string;
  applied_by?: string;
};

export interface PayrollSummaryRow {
  worker_id: string;
  worker_name: string;
  role: string;
  branch_id: string;
  monthly_salary: number;
  daily_salary_cost: number;
  advances_total: number;
  deductions_total: number;
  net_to_pay: number;
}

export interface PayrollSummary {
  period: string;             // YYYY-MM
  branch_id?: string;
  days_in_period: number;
  rows: PayrollSummaryRow[];
  totals: {
    workers: number;
    monthly_salary: number;
    daily_salary_cost: number;
    advances: number;
    deductions: number;
    net_to_pay: number;
  };
}

// ---------- Service functions ----------

const withBranch = (base: string, branchId?: string) =>
  branchId ? `${base}${base.includes("?") ? "&" : "?"}branch_id=${encodeURIComponent(branchId)}` : base;

export async function listWorkers(branchId?: string): Promise<PayrollWorker[]> {
  if (USE_MOCKS) return mockListWorkers(branchId);
  const res = await apiClient<any>(withBranch(`/payroll/workers`, branchId));
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}

export async function createWorker(payload: WorkerPayload): Promise<PayrollWorker> {
  if (USE_MOCKS) return mockCreateWorker(payload);
  const res = await apiClient<any>(`/payroll/workers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateWorker(id: string, payload: Partial<WorkerPayload>): Promise<PayrollWorker> {
  if (USE_MOCKS) return mockUpdateWorker(id, payload);
  const res = await apiClient<any>(`/payroll/workers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function deleteWorker(id: string): Promise<{ id: string }> {
  if (USE_MOCKS) return mockDeleteWorker(id);
  const res = await apiClient<any>(`/payroll/workers/${id}`, { method: "DELETE" });
  return res?.data || res || { id };
}

export async function listAdvances(workerId: string, period?: string): Promise<PayrollAdvance[]> {
  if (USE_MOCKS) return mockListAdvances(workerId, period);
  const url = period
    ? `/payroll/workers/${workerId}/advances?period=${encodeURIComponent(period)}`
    : `/payroll/workers/${workerId}/advances`;
  const res = await apiClient<any>(url);
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}

export async function recordAdvance(workerId: string, payload: AdvancePayload): Promise<PayrollAdvance> {
  if (USE_MOCKS) return mockRecordAdvance(workerId, payload);
  const res = await apiClient<any>(`/payroll/workers/${workerId}/advances`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function listDeductions(workerId: string, period?: string): Promise<PayrollDeduction[]> {
  if (USE_MOCKS) return mockListDeductions(workerId, period);
  const url = period
    ? `/payroll/workers/${workerId}/deductions?period=${encodeURIComponent(period)}`
    : `/payroll/workers/${workerId}/deductions`;
  const res = await apiClient<any>(url);
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}

export async function recordDeduction(workerId: string, payload: DeductionPayload): Promise<PayrollDeduction> {
  if (USE_MOCKS) return mockRecordDeduction(workerId, payload);
  const res = await apiClient<any>(`/payroll/workers/${workerId}/deductions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function getPayrollSummary(period: string, branchId?: string): Promise<PayrollSummary> {
  if (USE_MOCKS) return mockGetPayrollSummary(period, branchId);
  const res = await apiClient<any>(
    withBranch(`/payroll/summary?period=${encodeURIComponent(period)}`, branchId),
  );
  return res?.data || res;
}
