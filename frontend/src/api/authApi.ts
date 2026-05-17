import { apiJson } from './http'
import type { AuthResponse, LoginRequest, RegisterRequest } from './types'

export function login(body: LoginRequest) {
  return apiJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function register(body: RegisterRequest) {
  return apiJson<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Guest / anonymous customer session for checkout without a user account.
 * Backend should return the same token shape as login, with ROLE_CUSTOMER (or equivalent).
 */
export function guestCustomerSession() {
  return apiJson<AuthResponse>('/api/auth/guest-customer', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
