import { apiClient, ensureValidTokenOrMessage } from "~/lib/api";

export interface BranchPayload {
  name: string;
  campus?: string;
  regular_price?: string | number;
  vip_price?: string | number;
  vvip_price?: string | number;
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
