import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import EventSeatIcon from '@mui/icons-material/EventSeat'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import * as agentApi from '../../api/agentApi'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../api/http'

export function AgentDashboardPage() {
  const { accessToken } = useAuth()
  const [walletLoading, setWalletLoading] = useState(true)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [pending, setPending] = useState<number | null>(null)

  useEffect(() => {
    if (!accessToken) return
    let c = false
    ;(async () => {
      setWalletLoading(true)
      setWalletError(null)
      try {
        const w = await agentApi.getAgentWallet(accessToken)
        if (!c) {
          setBalance(w.balance)
          setPending(w.pendingSettlement ?? null)
        }
      } catch (e: unknown) {
        if (!c) {
          setWalletError(e instanceof ApiError ? e.message : 'Wallet unavailable')
          setBalance(12850)
          setPending(2100)
        }
      } finally {
        if (!c) setWalletLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [accessToken])

  const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Today
      </Typography>
      <Typography color="text.secondary">Borivali stop · Shift A</Typography>

      <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <AccountBalanceWalletIcon />
            <Typography sx={{ fontWeight: 800 }}>Agent wallet</Typography>
            {walletLoading && <CircularProgress size={18} color="inherit" sx={{ ml: 1 }} />}
          </Stack>
          {walletError && (
            <Alert severity="warning" sx={{ mb: 1, color: 'text.primary' }}>
              {walletError} — showing placeholder balance until <code>GET /api/agent/wallet</code> is live.
            </Alert>
          )}
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {balance != null ? fmt.format(balance) : '—'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Available for settlements &amp; cash reconciliation
          </Typography>
          {pending != null && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.85 }}>
              Pending settlement: {fmt.format(pending)}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <EventSeatIcon color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
              14
            </Typography>
            <Typography color="text.secondary">Cash bookings</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <FactCheckIcon color="primary" />
            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
              38
            </Typography>
            <Typography color="text.secondary">Boarding checks</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <QrCodeScannerIcon color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
              2
            </Typography>
            <Typography color="text.secondary">Open alerts</Typography>
          </CardContent>
        </Card>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 700 }}>Next departure</Typography>
            <Chip label="Live" color="success" size="small" />
          </Stack>
          <Typography color="text.secondary">Mumbai → Pune · Volvo B11R</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            06:30 · Gate 3
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button component={RouterLink} to="/agent/search" variant="contained">
              Book seats
            </Button>
            <Button component={RouterLink} to="/agent/boarding/1" variant="outlined">
              Boarding / manifest (trip 1)
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
