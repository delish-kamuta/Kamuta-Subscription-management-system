import { apiClient, ensureValidTokenOrMessage } from "~/lib/api";

export type FeedbackType =
  | "meal_quality"
  | "service_speed"
  | "staff_behavior"
  | "cleanliness"
  | "other";

export type FeedbackRating = "POOR" | "AVERAGE" | "GOOD" | "EXCELLENT";

export interface SubmitFeedbackPayload {
  type: FeedbackType | string;
  rating: FeedbackRating | string;
  message: string;
  is_anonymous?: boolean;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function submitFeedback(
  payload: SubmitFeedbackPayload
): Promise<SubmitFeedbackResponse> {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) return { success: false, message: tokenError };
  try {
    const data = await apiClient<any>("/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data as SubmitFeedbackResponse;
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" };
  }
}

// Admin/staff: list feedbacks with optional filters
export interface FeedbackFilters {
  type?: string;   // meal_quality, service_quality, cleanliness, pricing, staff_behavior, system_issue, suggestion, complaint
  status?: string; // pending, reviewed, resolved, dismissed
  rating?: string; // EXCELLENT, GOOD, AVERAGE, POOR, TERRIBLE
}

export interface FeedbackItem {
  id?: string | number;
  user_id?: string | number;
  userId?: string | number;
  type?: string;
  rating?: string;
  title?: string;
  message?: string;
  status?: string;
  is_anonymous?: boolean;
  user_name?: string;
  user_phone?: string;
  branch_name?: string;
  created_at?: string;
}

export interface ListFeedbackResponse {
  success: boolean;
  message?: string;
  data?:{
    data?: FeedbackItem[]
  };
}

export async function listFeedbacks(filters: FeedbackFilters = {}): Promise<ListFeedbackResponse> {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) return { success: false, message: tokenError };
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  try {
    const data = await apiClient<any>(`/feedback${queryString}`);
    return data as ListFeedbackResponse;
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" };
  }
}

// Admin/staff: get aggregated feedback statistics
export interface FeedbackStats {
  total?: number;
  by_type?: Record<string, number>;
  by_status?: Record<string, number>;
  average_rating?: number | string;
}

export interface FeedbackStatsResponse {
  success: boolean;
  message?: string;
  data?: FeedbackStats;
}

export async function getFeedbackStats(): Promise<FeedbackStatsResponse> {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) return { success: false, message: tokenError };
  try {
    const data = await apiClient<any>("/feedback/stats");
    return data as FeedbackStatsResponse;
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" };
  }
}

// Get a single feedback by ID
export interface GetFeedbackByIdResponse {
  success: boolean;
  message?: string;
  data?: FeedbackItem;
}

export async function getFeedbackById(id: string | number): Promise<GetFeedbackByIdResponse> {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) return { success: false, message: tokenError };
  try {
    const data = await apiClient<any>(`/feedback/${encodeURIComponent(String(id))}`);
    return data as GetFeedbackByIdResponse;
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" };
  }
}

// Update feedback status (admin/cashier)
export type FeedbackStatus = "pending" | "reviewed" | "resolved" | "dismissed" | string;

export interface UpdateFeedbackStatusResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function updateFeedbackStatus(
  id: string | number,
  status: FeedbackStatus
): Promise<UpdateFeedbackStatusResponse> {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) return { success: false, message: tokenError };
  try {
    const data = await apiClient<any>(`/feedback/${encodeURIComponent(String(id))}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return data as UpdateFeedbackStatusResponse;
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" };
  }
}
