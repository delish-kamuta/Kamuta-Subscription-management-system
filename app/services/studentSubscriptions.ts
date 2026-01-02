import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";
import { apiClient } from "~/lib/api";

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

export function mapApiToSubscriptionItem(item: ApiSubscription): SubscriptionItem {
  const clientName = item.student?.user?.full_name || "";
  const regNumber = item.student?.reg_number || item.id || "";
  const userId = item.student?.user_id || item.student?.user?.id || "";
  const phone = item.student?.user?.phone || "";
  const paymentMethod = (item.payment_history && item.payment_history.length > 0)
    ? (item.payment_history[0]?.payment_method || "")
    : "";
  const branchName = item.student?.user?.branch_id ? String(item.student.user.branch_id) : "";
  return {
    id: regNumber,
    subscriptionId: item.id,
    userId: userId || undefined,
    tel: phone,
    clientName,
    subscriptionType: item.meal_type || "",
    // Customer Type: the endpoint represents student subscriptions, so default to Student
    customerType: 'Student',
    branch: branchName,
    dateStarted: item.start_date || item.created_at || "",
    totalMeals: Number(item.total_meals ?? 0),
    mealsLeft: Number(item.remaining_meals ?? item.total_meals ?? 0),
    payment: paymentMethod,
    amountPaid: item.amount_paid,
    status: item.status,
  };
}

export async function listStudentSubscriptions(token: string | null): Promise<SubscriptionItem[]> {
  const json = await apiClient<any>("/student-subscriptions");
  const items: ApiSubscription[] = json.data || json.items || json;
  return Array.isArray(items) ? items.map(mapApiToSubscriptionItem) : [];
}

export async function createStudentSubscription(token: string | null, payload: any): Promise<any> {
  return apiClient("/student-subscriptions", {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateStudentSubscription(token: string | null, id: string, payload: any): Promise<any> {
  return apiClient(`/student-subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function cancelStudentSubscription(token: string | null, id: string): Promise<any> {
  return apiClient(`/student-subscriptions/${id}/cancel`, {
    method: 'POST',
  });
}
