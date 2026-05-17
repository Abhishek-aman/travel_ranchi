/** Extract roles from Spring Security JWT claims (best-effort). */
export function getRolesFromToken(token: string): string[] {
  if (!token) return []
  try {
    const payload = token.split('.')[1]
    if (!payload) return []
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>

    const out = new Set<string>()

    const addRaw = (s: unknown) => {
      if (typeof s !== 'string' || !s.length) return
      s.split(/[\s,]+/).forEach((x) => {
        if (!x) return
        out.add(x)
        const u = x.toUpperCase()
        // Normalize bare CUSTOMER / AGENT / ADMIN to Spring-style ROLE_* for guards
        if (u === 'CUSTOMER' || u === 'AGENT' || u === 'ADMIN') {
          out.add(`ROLE_${u}`)
        }
        if (u.startsWith('ROLE_')) {
          out.add(u.replace(/^ROLE_/, ''))
        }
      })
    }

    // Always read singular `role` (common in custom JWTs) — do not let empty `authorities: []` hide it
    addRaw(json.role)

    const authorities = json.authorities
    if (Array.isArray(authorities) && authorities.length > 0) {
      authorities.forEach((a) => {
        if (typeof a === 'string') addRaw(a)
        else if (a && typeof a === 'object' && 'authority' in a) addRaw(String((a as { authority: string }).authority))
      })
    }

    const roles = json.roles
    if (Array.isArray(roles) && roles.length > 0) {
      roles.forEach((a) => addRaw(a))
    }

    addRaw(json.scope)
    addRaw(json.scp)

    const realm = json.realm_access as { roles?: string[] } | undefined
    if (realm?.roles?.length) realm.roles.forEach((r) => addRaw(r))

    return [...out]
  } catch {
    return []
  }
}

export function hasRole(token: string | null, role: string): boolean {
  if (!token) return false
  const wantFull = role.startsWith('ROLE_') ? role : `ROLE_${role}`
  const wantBare = wantFull.replace(/^ROLE_/i, '')
  const roles = getRolesFromToken(token)
  return roles.some((x) => {
    const u = x.toUpperCase()
    return (
      u === wantFull.toUpperCase() ||
      u === wantBare.toUpperCase() ||
      u === `ROLE_${wantBare}`.toUpperCase()
    )
  })
}

/** Decide post-login route from JWT roles. */
export function getPostLoginPath(roles: string[]): 'admin' | 'agent' | 'customer' {
  const r = roles.map((x) => x.toUpperCase())
  if (r.some((x) => x.includes('ADMIN'))) return 'admin'
  if (r.some((x) => x.includes('AGENT'))) return 'agent'
  return 'customer'
}
