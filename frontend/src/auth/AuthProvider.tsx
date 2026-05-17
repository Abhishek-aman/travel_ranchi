import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as authApi from '../api/authApi'
import { getRolesFromToken, hasRole as tokenHasRole } from './jwt'
import { extractAccessToken } from './tokenResponse'
import { AuthContext, type AuthContextValue } from './authContext'

const STORAGE_KEY = 'fleetline_access_token'
const CUSTOMER_STORAGE_KEY = 'fleetline_customer_access_token'

function emailFromToken(token: string | null): string | null {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { sub?: string; email?: string }
    return json.email ?? json.sub ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))
  const [customerAccessToken, setCustomerAccessToken] = useState<string | null>(() =>
    localStorage.getItem(CUSTOMER_STORAGE_KEY),
  )
  const [guestSessionLoading, setGuestSessionLoading] = useState(false)
  const [guestSessionError, setGuestSessionError] = useState<string | null>(null)
  const customerTokenRef = useRef(customerAccessToken)

  useEffect(() => {
    customerTokenRef.current = customerAccessToken
  }, [customerAccessToken])

  const persistOperator = useCallback((token: string | null) => {
    setAccessToken(token)
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  const persistCustomer = useCallback((token: string | null) => {
    setCustomerAccessToken(token)
    if (token) localStorage.setItem(CUSTOMER_STORAGE_KEY, token)
    else localStorage.removeItem(CUSTOMER_STORAGE_KEY)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login({ email, password })
      const t = extractAccessToken(data)
      if (!t) throw new Error('Login succeeded but no access token was returned. Check API field name (accessToken / access_token).')
      const roles = getRolesFromToken(t)
      const isStaff = roles.some((r) => /ADMIN|AGENT/i.test(r))
      if (isStaff) {
        persistCustomer(null)
      }
      persistOperator(t)
      return t
    },
    [persistOperator, persistCustomer],
  )

  const logout = useCallback(() => {
    persistOperator(null)
  }, [persistOperator])

  const clearCustomerSession = useCallback(() => {
    persistCustomer(null)
    setGuestSessionError(null)
  }, [persistCustomer])

  const ensureGuestCustomer = useCallback(async () => {
    const ct = customerTokenRef.current
    if (ct && tokenHasRole(ct, 'ROLE_CUSTOMER')) {
      setGuestSessionError(null)
      return
    }
    setGuestSessionLoading(true)
    setGuestSessionError(null)
    try {
      const data = await authApi.guestCustomerSession()
      const t = extractAccessToken(data)
      if (!t) throw new Error('Guest session succeeded but no access token was returned.')
      persistCustomer(t)
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : 'Could not start a guest booking session. Your API must expose POST /api/auth/guest-customer (same response shape as login).'
      setGuestSessionError(msg)
      persistCustomer(null)
    } finally {
      setGuestSessionLoading(false)
    }
  }, [persistCustomer])

  const roles = useMemo(() => (accessToken ? getRolesFromToken(accessToken) : []), [accessToken])

  const email = useMemo(() => emailFromToken(accessToken), [accessToken])

  const hasRole = useCallback(
    (role: 'CUSTOMER' | 'AGENT' | 'ADMIN') => {
      const full = `ROLE_${role}` as const
      if (role === 'CUSTOMER' && customerAccessToken) {
        return tokenHasRole(customerAccessToken, full)
      }
      return tokenHasRole(accessToken, full)
    },
    [accessToken, customerAccessToken],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      email,
      roles,
      isAuthenticated: Boolean(accessToken),
      customerAccessToken,
      login,
      logout,
      hasRole,
      ensureGuestCustomer,
      clearCustomerSession,
      guestSessionError,
      guestSessionLoading,
    }),
    [
      accessToken,
      email,
      roles,
      login,
      logout,
      hasRole,
      customerAccessToken,
      ensureGuestCustomer,
      clearCustomerSession,
      guestSessionError,
      guestSessionLoading,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
