import { apiClient } from "~/lib/api"

export interface UserPayload {
  full_name: string
  phone: string
  role: string
  branch_id: string | number
  password?: string
  reg_number?: string
}

export async function createUser(payload: UserPayload) {
  return apiClient("/users", {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id: string | number, payload: Partial<UserPayload>) {
  return apiClient(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: string | number) {
  await apiClient(`/users/${id}`, {
    method: 'DELETE',
  });
  return true;
}
