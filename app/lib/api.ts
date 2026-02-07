import { store } from "~/store/store"

// Use environment variable if available, otherwise fallback (useful for local dev)
export const API_BASE_URL = "https://kamuta-subscription-management-system-bn-p99l.onrender.com/api";
// export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://delish-kamuta.com/api";

console.log(`[API] Configuration: Base URL is ${API_BASE_URL}`);

export function getToken(): string | null {
  // Prefer Redux token
  const state = store.getState()
  const reduxToken = state?.auth?.token || ''
  const reduxClean = (reduxToken || '').trim()
  if (reduxClean) return reduxClean

  // Fallback to localStorage
  if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('authToken') || ''
      const token = raw.trim()
      return token || null
  }
  return null;
}

export interface ApiError {
    message: string;
    status: number;
}

export async function apiClient<T = any>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers || {})
  
  if (token) {
    headers.set('Authorization', token)
  }
  
  if (!headers.has('Content-Type') && init.method && init.method.toUpperCase() !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, { ...init, headers })

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
  } else {
      data = await response.text();
  }

  if (!response.ok) {
      const error: ApiError = {
          message: data?.message || data?.error || `Request failed with status ${response.status}`,
          status: response.status
      };
      throw error;
  }

  return data as T;
}

// Deprecated: Use apiClient instead
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const token = getToken()
    const headers = new Headers(init.headers || {})
    if (token) {
      headers.set('Authorization', token)
    }
    if (!headers.has('Content-Type') && init.method && init.method.toUpperCase() !== 'GET') {
      headers.set('Content-Type', 'application/json')
    }
    
    let url = input.toString();
    if (!url.startsWith('http')) {
        url = `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
    }

    return fetch(url, { ...init, headers })
}

export function ensureValidTokenOrMessage(): string | null {
  const token = getToken()
  if (!token) return 'Not authenticated. Please log in again.'
  if (token.split('.').length !== 3) return 'Invalid token format. Please re-login to refresh your session.'
  return null
}