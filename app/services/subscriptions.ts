import { apiClient } from "~/lib/api";
import type { ApiSubscription } from "./studentSubscriptions";

export * from "./studentSubscriptions";
export * from "./workerSubscriptions";

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
              (t.status || '')
            ).toLowerCase();

            // Only include if it looks like a top-up or credit
            if (
              combinedStr.includes('top') || 
              combinedStr.includes('credit') || 
              combinedStr.includes('deposit') ||
              (t.amount && Number(t.amount) > 0 && !combinedStr.includes('debit') && !combinedStr.includes('payment'))
            ) {
               rows.push({
                id: rows.length + 1,
                customerName,
                regNumber,
                amount: String(t.amount || ''),
                paymentMethod: t.payment_method || t.method || 'Wallet',
                date: t.created_at || t.date || '',
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

  return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
