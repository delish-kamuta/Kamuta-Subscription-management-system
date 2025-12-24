import { apiClient, ensureValidTokenOrMessage } from "~/lib/api";

export interface BranchPayload {
  name: string;
  campus: string;
  student_regular_price: string | number;
  student_vip_price: string | number;
  student_vvip_price: string | number;
  worker_regular_price: string | number;
  worker_vip_price: string | number;
  worker_vvip_price: string | number;
  irregular_regular_price: string | number;
  irregular_vip_price: string | number;
  irregular_vvip_price: string | number;
}

export async function createBranch(payload: BranchPayload) {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) throw new Error(tokenError);

  return apiClient("/branches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateBranch(id: string, payload: Partial<BranchPayload>) {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) throw new Error(tokenError);

  return apiClient(`/branches/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteBranch(id: string) {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) throw new Error(tokenError);

  return apiClient(`/branches/${id}`, {
    method: "DELETE",
  });
}
