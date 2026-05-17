import { createContext } from 'react'

export interface AuthContextValue {
  /** Operator (admin) or counter staff (agent) JWT — never used for public seat booking APIs. */
  accessToken: string | null
  email: string | null
  roles: string[]
  isAuthenticated: boolean
  /** JWT used for `/api/customer/*` — issued silently as guest when the backend supports it. */
  customerAccessToken: string | null
  /** Resolves to the stored operator access token (use for immediate post-login navigation). */
  login: (email: string, password: string) => Promise<string>
  logout: () => void
  hasRole: (role: 'CUSTOMER' | 'AGENT' | 'ADMIN') => boolean
  /** Ensures a customer-scoped JWT exists for online booking; no UI sign-in required. */
  ensureGuestCustomer: () => Promise<void>
  clearCustomerSession: () => void
  guestSessionError: string | null
  guestSessionLoading: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
