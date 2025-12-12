import { getToken, ensureValidTokenOrMessage } from "~/lib/api"

export interface UserPayload {
  full_name: string
  phone: string
  role: string
  branch_id: string | number
  password?: string
  reg_number?: string
}

export async function createUser(payload: UserPayload) {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) throw new Error(tokenError)
  const token = getToken()
  const resp = await fetch('https://restaurant-bn-api.onrender.com/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Backend accepts raw token; if already Bearer, keep as-is
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(payload),
  })
  if (!resp.ok) {
    let msg = 'Failed to add user'
    try { const j = await resp.json(); msg = j.message || j.error || msg } catch {}
    throw new Error(msg)
  }
  return resp.json()
}

export async function updateUser(id: string | number, payload: Partial<UserPayload>) {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) throw new Error(tokenError)
  const token = getToken()
  const resp = await fetch(`https://restaurant-bn-api.onrender.com/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(payload),
  })
  if (!resp.ok) {
    let msg = 'Failed to update user'
    try { const j = await resp.json(); msg = j.message || j.error || msg } catch {}
    throw new Error(msg)
  }
  return resp.json()
}

export async function deleteUser(id: string | number) {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) throw new Error(tokenError)
  const token = getToken()
  const resp = await fetch(`https://restaurant-bn-api.onrender.com/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: token } : {}),
    },
  })
  if (!resp.ok) {
    let msg = 'Failed to delete user'
    try { const j = await resp.json(); msg = j.message || j.error || msg } catch {}
    throw new Error(msg)
  }
  return true
}
