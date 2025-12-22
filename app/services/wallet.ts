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
