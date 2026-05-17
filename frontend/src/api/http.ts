import { API_BASE_URL } from '../config'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiJson<T>(
  path: string,
  init: RequestInit & { accessToken?: string | null } = {},
): Promise<T> {
  const { accessToken, headers: initHeaders, ...rest } = init
  const headers = new Headers(initHeaders)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
  })

  if (!res.ok) {
    const text = await res.text()
    let msg = text || res.statusText
    try {
      const j = JSON.parse(text) as { error?: string; message?: string }
      msg = j.error ?? j.message ?? msg
    } catch {
      /* plain text */
    }
    throw new ApiError(res.status, msg)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  if (!text) {
    return undefined as T
  }

  const ct = res.headers.get('content-type') ?? ''
  const trimmed = text.trim()
  const looksJson = trimmed.startsWith('{') || trimmed.startsWith('[')
  // Many servers omit charset or send non-standard types; still parse JSON bodies
  if (ct.includes('application/json') || ct.includes('+json') || looksJson) {
    try {
      return JSON.parse(text) as T
    } catch {
      throw new ApiError(res.status, 'Response was not valid JSON')
    }
  }

  return undefined as T
}

export async function apiBlob(
  path: string,
  accessToken: string,
): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new ApiError(res.status, text || res.statusText)
  }
  return res.blob()
}
