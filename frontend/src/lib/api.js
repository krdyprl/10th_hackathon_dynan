const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function apiUrl(path) {
  return `${BASE_URL}${path}`
}

export async function apiFetch(path, options = {}) {
  const { data: { session } } = await import('./supabase').then(m => m.supabase.auth.getSession())
  const headers = { ...options.headers }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  const res = await fetch(apiUrl(path), { ...options, headers })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json()
}
