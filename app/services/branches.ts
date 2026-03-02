import { apiClient, ensureValidTokenOrMessage } from "~/lib/api";

export interface Branch {
  id: string;
  name: string;
  campus?: string;
}

export interface BranchPayload {
  name: string;
  campus: string;
  student_regular_price: string | number;
  student_vip_price: string | number;
  student_vvip_price: string | number;
  worker_regular_price: string | number;
  worker_vip_price: string | number;
  worker_vvip_price: string | number;
  irregular_student_regular_price: string | number;
  irregular_student_vip_price: string | number;
  irregular_student_vvip_price: string | number;
  irregular_worker_regular_price: string | number;
  irregular_worker_vip_price: string | number;
  irregular_worker_vvip_price: string | number;
}

export async function getAllBranches(): Promise<{ branches: Branch[] }> {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) throw new Error(tokenError);

  const data = await apiClient<any>("/branches");
  const list = Array.isArray(data?.data) ? data.data : [];
  return {
    branches: list.map((b: any) => ({
      id: String(b.id),
      name: String(b.name || ""),
      campus: String(b.campus || ""),
    })),
  };
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
