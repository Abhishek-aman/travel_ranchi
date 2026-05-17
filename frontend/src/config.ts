/**
 * API base URL (no trailing slash).
 * - Local dev: `http://localhost:8080` (default) or your backend URL.
 * - Docker/production: set `VITE_API_BASE_URL=__SAME_ORIGIN__` so requests use
 *   `/api/*` on the same domain. Caddy proxies those requests to the backend.
 */
const SAME_ORIGIN_SENTINEL = '__SAME_ORIGIN__'

function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (raw === undefined) {
    return 'http://localhost:8080'
  }
  const trimmed = raw.trim().replace(/\/$/, '')
  if (trimmed === '' || trimmed === SAME_ORIGIN_SENTINEL) {
    return ''
  }
  // HTTPS sites cannot call `http://` APIs (mixed content). Use same-origin `/api/*`
  // so the production reverse proxy can reach the backend even if the build still
  // has `VITE_API_BASE_URL=http://...` by mistake.
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    trimmed.startsWith('http://')
  ) {
    return ''
  }
  return trimmed
}

export const API_BASE_URL = resolveApiBaseUrl()

/** Default fare per seat (₹) when backend does not expose pricing on trip DTOs. */
export const DEFAULT_FARE_PER_SEAT = Number(import.meta.env.VITE_FARE_PER_SEAT ?? 499)
