/** Normalize Spring / various auth JSON bodies to a bearer token string. */
export function extractAccessToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  const candidates = [d.accessToken, d.access_token, d.token, d.access]
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) return c
  }
  return null
}
