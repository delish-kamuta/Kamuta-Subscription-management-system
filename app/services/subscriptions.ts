import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";

const BASE_URL = "https://restaurant-bn-api.onrender.com/api";

export interface ApiSubscription {
  id: string;
  student_id?: string;
  meal_type?: string;
  total_meals?: number;
  remaining_meals?: number;
  amount_paid?: string | number;
  start_date?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  student?: {
    id?: string;
    user_id?: string;
    reg_number?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    user?: {
      id?: string;
      full_name?: string;
      phone?: string;
      branch_id?: string;
    }
  };
  payment_history?: Array<{
    id?: string;
    subscription_id?: string;
    amount?: string | number;
    payment_method?: string;
    created_at?: string;
  }>;
}

function mapApiToSubscriptionItem(item: ApiSubscription): SubscriptionItem {
  const clientName = item.student?.user?.full_name || "";
  const regNumber = item.student?.reg_number || item.id || "";
  const paymentMethod = (item.payment_history && item.payment_history.length > 0)
    ? (item.payment_history[0]?.payment_method || "")
    : "";
  const branchName = item.student?.user?.branch_id ? String(item.student.user.branch_id) : "";
  return {
    id: regNumber,
    clientName,
    subscriptionType: item.meal_type || "",
    // Customer Type: the endpoint represents student subscriptions, so default to Student
    customerType: 'Student',
    branch: branchName,
    dateStarted: item.start_date || item.created_at || "",
    totalMeals: Number(item.total_meals ?? 0),
    mealsLeft: Number(item.remaining_meals ?? item.total_meals ?? 0),
    payment: paymentMethod,
  };
}

export async function listStudentSubscriptions(token: string | null): Promise<SubscriptionItem[]> {
  const res = await fetch(`${BASE_URL}/student-subscriptions`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `${token}` } : {}),
    },
  });
  if (!res.ok) {
    let msg = `Failed to fetch: ${res.status}`;
    try { const data = await res.json(); msg = data.message || data.error || msg; } catch {}
    throw new Error(msg);
  }
  const json = await res.json();
  const items: ApiSubscription[] = json.data || json.items || json;
  return Array.isArray(items) ? items.map(mapApiToSubscriptionItem) : [];
}

export async function createStudentSubscription(token: string | null, payload: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/student-subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = `Failed to create: ${res.status}`;
    try { const data = await res.json(); msg = data.message || data.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export interface PaymentRow {
  id: number;
  customerName: string;
  regNumber: string;
  amount: string;
  paymentMethod: string;
  date: string;
  status: string;
  branch: string;
  cashier: string;
}

export async function listPaymentsFromSubscriptions(token: string | null): Promise<PaymentRow[]> {
  // Fetch raw subscriptions to access payment_history
  const res = await fetch(`${BASE_URL}/student-subscriptions`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `${token}` } : {}),
    },
  });
  if (!res.ok) {
    let msg = `Failed to fetch: ${res.status}`;
    try { const data = await res.json(); msg = data.message || data.error || msg; } catch {}
    throw new Error(msg);
  }
  const json = await res.json();
  const apiItems: ApiSubscription[] = json.data || json.items || json;
  const rows: PaymentRow[] = [];
  apiItems.forEach((api) => {
    const regNumber = api.student?.reg_number || api.id || '';
    const customerName = api.student?.user?.full_name || '';
    const branchId = api.student?.user?.branch_id ? String(api.student.user.branch_id) : '';
    const history = Array.isArray(api.payment_history) ? api.payment_history : [];
    history.forEach((ph) => {
      rows.push({
        id: rows.length + 1,
        customerName,
        regNumber,
        amount: String(ph.amount ?? api.amount_paid ?? ''),
        paymentMethod: ph.payment_method || '',
        date: ph.created_at || api.created_at || api.start_date || '',
        status: 'Completed',
        branch: branchId,
        cashier: 'N/A',
      });
    });
  });
  return rows;
}