import { apiClient } from "~/lib/api";
import type { ApiSubscription } from "./studentSubscriptions";
import { getWorkerWalletTransactions } from "./wallet";

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

function normalizePaymentMethod(method: string | undefined | null): string {
  const lower = (method || '').toLowerCase();
  if (lower.includes('cash')) return 'Cash';
  if (lower.includes('momo') || lower.includes('mobile') || lower.includes('mtn') || lower.includes('airtel')) return 'Momo';
  return 'Momo';
}

function extractArray(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.data?.items)) return json.data.items;
  return [];
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
    const apiItems: ApiSubscription[] = extractArray(json);
    
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
            paymentMethod: normalizePaymentMethod(ph.payment_method),
            date: ph.created_at || api.created_at || api.start_date || '',
            status: 'Completed',
            branch: branchId,
            cashier: 'N/A',
          });
        });
      });
    }
  } else {
    console.error("Failed to fetch student subscriptions", studentRes.reason);
  }

  // Process Workers
  if (workerRes.status === 'fulfilled') {
    const json = workerRes.value;
    const workers: any[] = extractArray(json);
    
    if (Array.isArray(workers)) {
      // Fetch wallets for all workers to get transactions
      const walletPromises = workers.map(async (w: any) => {
        try {
          const txRes = await getWorkerWalletTransactions(w.id);
          return { worker: w, transactions: txRes.success ? txRes.data : [] };
        } catch (e) {
          console.error("Failed to fetch wallet for worker", w?.id, e);
          // ignore error
        }
        return { worker: w, transactions: [] };
      });

      const results = await Promise.all(walletPromises);

      results.forEach(({ worker: w, transactions }) => {
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
                paymentMethod: normalizePaymentMethod(ph.payment_method),
                date: ph.created_at || s.created_at || s.start_date || '',
                status: 'Completed',
                branch: branchId,
                cashier: 'N/A',
              });
           });
        });

        // 2. Process Wallet Transactions (Top Ups)
        if (Array.isArray(transactions)) {
          transactions.forEach((t: any) => {
            const combinedStr = (
              (t.type || '') + ' ' + 
              (t.transaction_type || '') + ' ' + 
              (t.payment_method || '') + ' ' + 
              (t.method || '') + ' ' + 
              (t.category || '') + ' ' +
              (t.description || '') + ' ' +
              (t.status || '')
            ).toLowerCase();
            
            // Only include if it looks like a top-up or credit, or simply a positive amount transaction that isn't explicitly a debit
            // We remove the check for 'payment' because some top-ups might be labeled as payment method 'payment' or similar.
            const isTopUp = combinedStr.includes('top') || 
              combinedStr.includes('credit') || 
              combinedStr.includes('deposit') ||
              combinedStr.includes('topup') ||
              (t.amount && Number(t.amount) > 0 && !combinedStr.includes('debit') && !combinedStr.includes('withdraw') && !combinedStr.includes('expense'));

            if (isTopUp) {
               rows.push({
                id: rows.length + 1,
                customerName,
                regNumber,
                amount: String(t.amount || ''),
                paymentMethod: normalizePaymentMethod(t.payment_method || t.method),
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
  } else {
    console.error("Failed to fetch workers for payments", workerRes.reason);
  }

  return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
