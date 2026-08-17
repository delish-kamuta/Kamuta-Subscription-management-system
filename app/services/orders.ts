import { apiClient } from "~/lib/api";
import {
  mockListOrders,
  mockGetOrdersSummary,
  mockCreateOrder,
  mockUpdateOrder,
  mockMarkOrderPaid,
  mockDeleteOrder,
} from "./__mocks__/orders.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCK_STORE === "true";

// ---------- Types ----------

export type OrderCustomerType = "student" | "campus";
export type OrderPaymentStatus = "paid" | "outstanding";

export interface Order {
  id: string;
  customer_name: string;
  customer_type: OrderCustomerType;
  event_date: string;            // YYYY-MM-DD — day the food is cooked/delivered
  branch_id: string;
  branch_name?: string;
  portions: number;              // used for the portion-based shared-cost split
  agreed_price: number;
  payment_status: OrderPaymentStatus;
  paid_date?: string;            // set when payment_status flips to "paid"
  notes?: string;

  // Server-computed cost breakdown (echoed back for display; frontend never
  // computes shared_cost_share itself).
  direct_ingredients_cost: number;
  shared_cost_share: number;
  computed_cost: number;         // direct + shared
  margin: number;                // agreed_price − computed_cost

  created_at: string;
}

export interface OrderPayload {
  customer_name: string;
  customer_type: OrderCustomerType;
  event_date: string;
  branch_id: string;
  portions: number;
  agreed_price: number;
  payment_status?: OrderPaymentStatus;   // server defaults from customer_type when omitted
  paid_date?: string;
  notes?: string;
}

export interface OrdersQuery {
  from?: string;
  to?: string;
  branch_id?: string;
  customer_type?: OrderCustomerType | "all";
  status?: OrderPaymentStatus | "all";
}

export interface OrderSummary {
  earned_in_period: number;      // sum of agreed_price for orders with event_date in range
  collected_in_period: number;   // sum of agreed_price for orders with paid_date in range
  outstanding_total: number;     // sum of agreed_price for all unpaid orders (ignores date)
  count: number;
  from?: string;
  to?: string;
  branch_id?: string;
}

// ---------- Service functions ----------

const buildOrdersUrl = (q: OrdersQuery = {}): string => {
  const params = new URLSearchParams();
  if (q.from) params.set("from", q.from);
  if (q.to) params.set("to", q.to);
  if (q.branch_id) params.set("branch_id", q.branch_id);
  if (q.customer_type && q.customer_type !== "all") params.set("customer_type", q.customer_type);
  if (q.status && q.status !== "all") params.set("status", q.status);
  const qs = params.toString();
  return `/orders${qs ? `?${qs}` : ""}`;
};

const buildSummaryUrl = (q: OrdersQuery = {}): string => {
  const params = new URLSearchParams();
  if (q.from) params.set("from", q.from);
  if (q.to) params.set("to", q.to);
  if (q.branch_id) params.set("branch_id", q.branch_id);
  const qs = params.toString();
  return `/orders/summary${qs ? `?${qs}` : ""}`;
};

export async function listOrders(query: OrdersQuery = {}): Promise<Order[]> {
  if (USE_MOCKS) return mockListOrders(query);
  const res = await apiClient<any>(buildOrdersUrl(query));
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}

export async function getOrdersSummary(query: OrdersQuery = {}): Promise<OrderSummary> {
  if (USE_MOCKS) return mockGetOrdersSummary(query);
  const res = await apiClient<any>(buildSummaryUrl(query));
  return res?.data || res;
}

export async function createOrder(payload: OrderPayload): Promise<Order> {
  if (USE_MOCKS) return mockCreateOrder(payload);
  const res = await apiClient<any>(`/orders`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateOrder(id: string, payload: Partial<OrderPayload>): Promise<Order> {
  if (USE_MOCKS) return mockUpdateOrder(id, payload);
  const res = await apiClient<any>(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function markOrderPaid(id: string, paidDate?: string): Promise<Order> {
  if (USE_MOCKS) return mockMarkOrderPaid(id, paidDate);
  const res = await apiClient<any>(`/orders/${id}/mark-paid`, {
    method: "POST",
    body: JSON.stringify({ paid_date: paidDate }),
  });
  return res?.data || res;
}

export async function deleteOrder(id: string): Promise<{ id: string }> {
  if (USE_MOCKS) return mockDeleteOrder(id);
  const res = await apiClient<any>(`/orders/${id}`, { method: "DELETE" });
  return res?.data || res || { id };
}
