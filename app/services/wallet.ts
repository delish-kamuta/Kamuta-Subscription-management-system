import { apiClient } from "~/lib/api"

export interface WorkerWalletResponse {
  success: boolean
  data?: {
    prepaid_amount: number
    remaining_amount: number
    credit_limit: number
    credit_used: number
    transactions: any[]
  }
  message?: string
}

export async function getWorkerWallet(workerId: string): Promise<WorkerWalletResponse> {
  try {
    const data = await apiClient<WorkerWalletResponse>(`/workers/${workerId}/wallet`);
    return data;
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to fetch wallet' };
  }
}

export async function addWorkerWalletPayment(workerId: string, payload: { amount: number; payment_method?: string; note?: string }): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    const data = await apiClient<any>(`/workers/${workerId}/wallet/payment`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: true, data: data?.data || data };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Add payment failed' };
  }
}

export async function getWorkerWalletTransactions(workerId: string): Promise<{ success: boolean; data: any[]; message?: string }> {
  try {
    const res = await apiClient<any>(`/workers/${workerId}/wallet/transactions`);
    // Handle nested data structure where transactions are in data.data
    const transactions = res.data?.data && Array.isArray(res.data.data) 
      ? res.data.data 
      : (Array.isArray(res.data) ? res.data : []);
      
    return { success: res.success, data: transactions, message: res.message };
  } catch (e) {
    return { success: false, data: [], message: e instanceof Error ? e.message : 'Failed to fetch transactions' };
  }
}
