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

function mapApiToSubscriptionItem(item: ApiSubscription): SubscriptionItem {
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

// WORKER SUBSCRIPTIONS
export async function listWorkerSubscriptions(token: string | null): Promise<SubscriptionItem[]> {
  const json = await apiClient<any>("/workers");
  const workers: any[] = json.data || json.items || json || [];

  const items: any[] = [];
  workers.forEach((w: any) => {
    const clientName = w?.user?.full_name || w?.full_name || '';
    const phone = String(w?.user?.phone || w?.phone || '');
    const branchId = w?.user?.branch_id != null ? String(w.user.branch_id) : (w?.branch_id != null ? String(w.branch_id) : '');
    const baseId = String(w?.reg_number || w?.id || '');
    const userId = String(w?.user?.id || w?.user_id || '');
    
    // Helper to get wallet object
    const walletObj = w?.wallet || w?.user?.wallet;
    
    const walletBalance = Number(
      (walletObj && (
        walletObj.remaining_amount ?? 
        walletObj.balance ?? 
        walletObj.amount ??
        walletObj.current_balance
      )) ??
      w?.wallet_balance ?? 
      w?.balance ?? 
      w?.remaining_amount ??
      0
    ) || 0;

    const prepaidBalance = Number(
      (walletObj && (
        walletObj.prepaid_amount ?? 
        walletObj.prepaid ??
        walletObj.prepaid_balance ?? 
        walletObj.balance
      )) ??
      w?.prepaid_balance ?? 
      w?.prepaid ?? 
      w?.prepaid_amount ??
      walletBalance
    ) || 0;

    const creditBalance = Number(
      (walletObj && (
        walletObj.credit_used ?? 
        walletObj.credit ?? 
        walletObj.credit_balance
      )) ??
      w?.credit_balance ?? 
      w?.credit ?? 
      w?.credit_used ??
      0
    ) || 0;
    const lastTopUp = String(
      (walletObj && (walletObj.lastTopUp ?? walletObj.last_topup)) ??
      w?.last_topup ?? w?.lastTopUp ?? w?.updated_at ?? ''
    );
    const mealsThisMonth = Number(w?.meals_this_month ?? w?.stats?.meals_this_month ?? 0) || 0;
    const lastMeal = String(w?.last_meal_at ?? w?.stats?.last_meal_at ?? '');
    const subs = Array.isArray(w?.subscriptions) ? w.subscriptions : [];
    if (subs.length > 0) {
      subs.forEach((s: any) => {
        const paymentMethod = Array.isArray(s?.payment_history) && s.payment_history.length > 0
          ? (s.payment_history[0]?.payment_method || '')
          : '';
        items.push({
          id:String(s?.id || baseId),
          userId: userId || undefined,
          tel: phone,
          clientName,
          subscriptionType: String(s?.meal_type || ''),
          customerType: 'Worker',
          branch: branchId,
          dateStarted: String(s?.start_date || s?.created_at || w?.created_at || ''),
          totalMeals: Number(s?.total_meals ?? 0),
          mealsLeft: Number(s?.remaining_meals ?? s?.total_meals ?? 0),
          payment: paymentMethod,
          // extra fields (not in SubscriptionItem type) for worker view
          walletBalance,
          prepaidBalance,
          creditBalance,
          mealsThisMonth,
          lastMeal,
          lastTopUp,
        });
      });
    } else {
      items.push({
        id: baseId,
        userId: userId || undefined,
        tel: phone,
        clientName,
        subscriptionType: '',
        customerType: 'Worker',
        branch: branchId,
        dateStarted: String(w?.created_at || ''),
        totalMeals: 0,
        mealsLeft: 0,
        payment: '',
        walletBalance,
        prepaidBalance,
        creditBalance,
        mealsThisMonth,
        lastMeal,
        lastTopUp,
      });
    }
  });
  return items as SubscriptionItem[];
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
  const [studentRes, workerRes] = await Promise.allSettled([
    apiClient<any>("/student-subscriptions"),
    apiClient<any>("/workers")
  ]);

  const rows: PaymentRow[] = [];

  // Process Students
  if (studentRes.status === 'fulfilled') {
    const json = studentRes.value;
    const apiItems: ApiSubscription[] = json.data || json.items || json;
    if (Array.isArray(apiItems)) {
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
    }
  }

  // Process Workers
  if (workerRes.status === 'fulfilled') {
    const json = workerRes.value;
    const workers: any[] = json.data || json.items || json || [];
    if (Array.isArray(workers)) {
      // Fetch wallets for all workers to get transactions
      const walletPromises = workers.map(async (w: any) => {
        try {
          const walletData = await apiClient<any>(`/workers/${w.id}/wallet`);
          return { worker: w, wallet: walletData.data };
        } catch (e) {
          // ignore error
        }
        return { worker: w, wallet: null };
      });

      const results = await Promise.all(walletPromises);

      results.forEach(({ worker: w, wallet }) => {
        const customerName = w?.user?.full_name || w?.full_name || '';
        const regNumber = w?.reg_number || w?.id || '';
        const branchId = w?.user?.branch_id != null ? String(w.user.branch_id) : (w?.branch_id != null ? String(w.branch_id) : '');
        
        // 1. Process Subscriptions (if any)
        const subs = Array.isArray(w?.subscriptions) ? w.subscriptions : [];
        subs.forEach((s: any) => {
           const history = Array.isArray(s.payment_history) ? s.payment_history : [];
           history.forEach((ph: any) => {
              rows.push({
                id: rows.length + 1,
                customerName,
                regNumber,
                amount: String(ph.amount ?? s.amount_paid ?? ''),
                paymentMethod: ph.payment_method || '',
                date: ph.created_at || s.created_at || s.start_date || '',
                status: 'Completed',
                branch: branchId,
                cashier: 'N/A',
              });
           });
        });

        // 2. Process Wallet Transactions (Top Ups)
        if (wallet && Array.isArray(wallet.transactions)) {
          wallet.transactions.forEach((t: any) => {
            const combinedStr = (
              (t.type || '') + ' ' + 
              (t.payment_method || '') + ' ' + 
              (t.method || '') + ' ' + 
              (t.category || '') + ' ' +
              (t.description || '') + ' ' +
              (t.note || '')
            ).toLowerCase();

            const isTopUp = combinedStr.includes('payment') || 
                            combinedStr.includes('credit') || 
                            combinedStr.includes('deposit') || 
                            combinedStr.includes('top') ||
                            combinedStr.includes('cash') ||
                            combinedStr.includes('momo') ||
                            combinedStr.includes('card') ||
                            combinedStr.includes('mobile') ||
                            combinedStr.includes('transfer') ||
                            combinedStr.includes('fund') ||
                            combinedStr.includes('admin');

            if (isTopUp) {
               rows.push({
                id: rows.length + 1,
                customerName,
                regNumber, // Using worker reg number as ID
                amount: String(t.amount ?? t.value ?? ''),
                paymentMethod: t.payment_method || t.method || 'Wallet',
                date: t.date || t.created_at || '',
                status: 'Completed',
                branch: branchId,
                cashier: 'N/A',
              });
            }
          });
        }
      });
    }
  }

  return rows;
}