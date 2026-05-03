import { isDemoMode, mockApi } from './demoMode'

export class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

const BASE = import.meta.env.VITE_API_URL as string

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (isDemoMode()) return mockApi(path, init) as Promise<T>
  const jwt = localStorage.getItem('drufiy_jwt')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (res.status === 401) {
      localStorage.removeItem('drufiy_jwt')
      window.location.href = '/login'
    }
    // FastAPI uses `detail`, our own errors use `message` or `error`
    const b = body as { detail?: string | { message?: string }; message?: string; error?: string }
    const msg =
      b.message ??
      (typeof b.detail === 'string' ? b.detail : b.detail?.message) ??
      res.statusText
    throw new ApiError(res.status, b.error ?? 'unknown', msg)
  }
  return res.json() as Promise<T>
}
