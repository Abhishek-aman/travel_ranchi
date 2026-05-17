import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../auth/useAuth'
import { getRolesFromToken } from '../../auth/jwt'

export function AgentLoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('agent@demo.local')
  const [password, setPassword] = useState('agent123')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const token = await login(email, password)
      const roles = getRolesFromToken(token)
      if (!roles.some((r) => r.toUpperCase().includes('AGENT'))) {
        setError('This account does not have ROLE_AGENT. Use agent@demo.local or a provisioned agent user.')
        return
      }
      window.location.replace('/agent')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="xs">
        <Typography variant="h5" gutterBottom textAlign="center" sx={{ fontWeight: 800 }}>
          Agent portal
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          POST /api/auth/login · role <code>ROLE_AGENT</code>
        </Typography>
        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={submit}>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" fullWidth />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
                <Typography variant="body2" textAlign="center">
                  <RouterLink to="/login">Use main sign in</RouterLink>
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
