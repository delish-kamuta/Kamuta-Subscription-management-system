import type { SubscriptionItem } from "~/hooks/useSubscriptionFilters";
import { apiClient } from "~/lib/api";

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
