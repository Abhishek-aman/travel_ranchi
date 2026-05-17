import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAuth } from '../auth/useAuth'
import { getRolesFromToken, getPostLoginPath } from '../auth/jwt'

function postLoginTarget(dest: ReturnType<typeof getPostLoginPath>, safeFrom: string): string {
  if (dest === 'admin') return '/admin'
  if (dest === 'agent') return '/agent'
  return safeFrom.startsWith('/') ? safeFrom : '/'
}

export function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const rawFrom = (location.state as { from?: string } | null)?.from ?? '/'
  const safeFrom = rawFrom === '/login' ? '/' : rawFrom

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const token = await login(email, password)
      const roles = getRolesFromToken(token)
      const dest = getPostLoginPath(roles)
      if (dest === 'customer') {
        setError('This sign-in is for operators and agents only. Travellers book from the home page without an account.')
        setLoading(false)
        return
      }
      const target = postLoginTarget(dest, safeFrom)
      setLoading(false)
      navigate(target, { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, textAlign: 'center' }}>
        Operator sign-in
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Admin: <code>admin@demo.local</code> / <code>admin123</code> · Agent: <code>agent@demo.local</code> /{' '}
        <code>agent123</code>
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <Box component="form" onSubmit={submit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
