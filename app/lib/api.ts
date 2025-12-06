import { store } from "~/store/store"

export function getToken(): string | null {
  // Prefer Redux token
  const state = store.getState()
  const reduxToken = state?.auth?.token || ''
  const reduxClean = (reduxToken || '').replace(/^Bearer\s+/i, '').trim()
  if (reduxClean) return reduxClean

  // Fallback to localStorage
  const raw = localStorage.getItem('authToken') || ''
  const token = raw.replace(/^Bearer\s+/i, '').trim()
  return token || null
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getToken()
  const headers = new Headers(init.headers || {})
  if (token) {
    // API expects the raw token without the 'Bearer ' prefix
    headers.set('Authorization', token)
  }
  if (!headers.has('Content-Type') && init.method && init.method.toUpperCase() !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(input, { ...init, headers })
}

export function ensureValidTokenOrMessage(): string | null {
  const token = getToken()
  if (!token) return 'Not authenticated. Please log in again.'
  if (token.split('.').length !== 3) return 'Invalid token format. Please re-login to refresh your session.'
  return null
}