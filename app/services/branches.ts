import { authFetch, ensureValidTokenOrMessage } from "~/lib/api";

const BASE_URL = "https://restaurant-bn-api.onrender.com/api/branches";

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

  const res = await authFetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `Failed to create branch: ${res.status}`;
    try {
      const data = await res.json();
      msg = data.message || data.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateBranch(id: string, payload: Partial<BranchPayload>) {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) throw new Error(tokenError);

  const res = await authFetch(`${BASE_URL}/${id}`, {
    method: "PATCH", // or PUT, usually PATCH for partial updates
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `Failed to update branch: ${res.status}`;
    try {
      const data = await res.json();
      msg = data.message || data.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteBranch(id: string) {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) throw new Error(tokenError);

  const res = await authFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let msg = `Failed to delete branch: ${res.status}`;
    try {
      const data = await res.json();
      msg = data.message || data.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
