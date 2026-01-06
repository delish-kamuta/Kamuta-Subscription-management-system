import { apiClient } from "~/lib/api";

export interface StatComparison {
  current: number;
  previous: number;
  change_percent: number;
}

export interface RevenueBreakdown {
  meal_revenue: number;
  subscription_revenue: number;
  wallet_topup_revenue: number;
  total: number;
}

export interface MealStatistics {
  by_type: {
    Regular: number;
    VIP: number;
    VVIP: number;
    total: number;
  };
  daily_trends: Record<string, number>;
}

export interface UserStatistics {
  student: number;
  worker: number;
  admin: number;
  cashier: number;
  scanner: number;
  total: number;
}

export interface FeedbackOverview {
  total: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  by_rating: Record<string, number>;
  average_rating: number;
}

export interface BranchInfo {
  id: string;
  name: string;
  campus: string;
  student_regular_price: number;
  student_vip_price: number;
  student_vvip_price: number;
  worker_regular_price: number;
  worker_vip_price: number;
  worker_vvip_price: number;
  irregular_student_regular_price: number;
  irregular_student_vip_price: number;
  irregular_student_vvip_price: number;
  irregular_worker_regular_price: number;
  irregular_worker_vip_price: number;
  irregular_worker_vvip_price: number;
  created_at: string;
  logs: any[];
}

export interface TimeRange {
  start: string;
  end: string;
  period: string;
}

export interface MonthlyData {
  month: string;
  total_subscriptions: number;
  total_meals: number;
  remaining_meals: number;
}

export interface OverviewSummary {
  total_revenue: StatComparison;
  total_meals: StatComparison;
  total_credit_used: number;
  active_subscriptions: number;
}

export interface OverviewData {
  summary: OverviewSummary;
  revenue_breakdown: RevenueBreakdown;
  meal_statistics: MealStatistics;
  user_statistics: UserStatistics;
  feedback_overview: FeedbackOverview;
  branch_comparison: BranchInfo[];
  time_range: TimeRange;
}

export interface DashboardAnalyticsData {
  summary: {
    people_served: {
      total: number;
      change_percent: number;
      trend: string;
    };
    total_revenue: {
      amount: number;
      currency: string;
      change_percent: number;
      trend: string;
    };
    top_branch: {
      name: string;
      meals_served: number;
    };
  };
  branch_analysis: {
    people_served_by_branch: {
      branch: string;
      people_served: number;
      percentage: number;
    }[];
    revenue_by_branch: {
      branch: string;
      subscription: number;
      paid_ticket: number;
      total: number;
    }[];
  };
  insights: string[];
}

export const getDashboardAnalytics = async (params: OverviewParams = {}) => {
  const query = new URLSearchParams();
  if (params.time_range) query.append('time_range', params.time_range);
  
  return apiClient<{ success: boolean; data: DashboardAnalyticsData }>(`/dashboard/analytics?${query.toString()}`);
};

export interface DashboardOverviewSummary {
  total_subscriptions: number;
  students_zero_meals: number;
  students_low_meals: number;
  students_plenty_meals: number;
}

export interface DashboardOverviewData {
  success: boolean;
  message: string;
  data: {
    monthly_data: MonthlyData[];
    summary: DashboardOverviewSummary;
  }
}

export interface OverviewParams {
  time_range?: 'today' | 'week' | 'month' | 'year';
  branch_id?: string;
}

export const getOverviewStats = async (params: OverviewParams = {}) => {
  const query = new URLSearchParams();
  if (params.time_range) query.append('time_range', params.time_range);
  if (params.branch_id) query.append('branch_id', params.branch_id);

  return apiClient<{ success: boolean; data: OverviewData }>(`/overview?${query.toString()}`);
};

export const getDashboardOverview = async () => {
  return apiClient<DashboardOverviewData>(`/dashboard/overview`);
};

export interface SubscriptionSummary {
  total_active: number;
  total_expired: number;
  new_subscriptions: StatComparison;
  expiring_soon: number;
  revenue: StatComparison;
}

export interface SubscriptionTrends {
  daily_new: any[];
  monthly_revenue: any[];
}

export interface SubscriptionStatistics {
  summary: SubscriptionSummary;
  by_meal_type: Record<string, number>;
  by_status: Record<string, number>;
  trends: SubscriptionTrends;
}

export const getSubscriptionOverview = async (params: OverviewParams = {}) => {
  const query = new URLSearchParams();
  if (params.time_range) query.append('time_range', params.time_range);
  if (params.branch_id) query.append('branch_id', params.branch_id);
  
  return apiClient<{ success: boolean; data: SubscriptionStatistics }>(`/overview/subscriptions?${query.toString()}`);
};

export interface PaymentMethodStats {
  count: number;
  amount: number;
  percentage: number;
}

export interface PaymentTypeStats {
  count: number;
  amount: number;
}

export interface PaymentSummary {
  total_revenue: number;
  total_payments: number;
  weekly_revenue: number;
  avg_payment_amount: number;
}

export interface PaymentStatistics {
  summary: PaymentSummary;
  by_payment_method: {
    cash: PaymentMethodStats;
    momo: PaymentMethodStats;
  };
  by_payment_type: {
    subscription: PaymentTypeStats;
    wallet: PaymentTypeStats;
  };
  daily_trends: any[];
}

export const getPaymentOverview = async (params: OverviewParams = {}) => {
  const query = new URLSearchParams();
  if (params.time_range) query.append('time_range', params.time_range);
  if (params.branch_id) query.append('branch_id', params.branch_id);
  
  return apiClient<{ success: boolean; data: PaymentStatistics }>(`/overview/payments?${query.toString()}`);
};
