import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import * as agentApi from '../../api/agentApi'
import type { PassengerVerifyDto } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../api/http'

export function AgentVerifyPage() {
  const { accessToken } = useAuth()
  const [tripId, setTripId] = useState('1')
  const [tab, setTab] = useState(0)
  const [qrToken, setQrToken] = useState('')
  const [bookingRef, setBookingRef] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PassengerVerifyDto | null>(null)

  const tid = Number(tripId)

  const run = async () => {
    if (!accessToken || !Number.isFinite(tid)) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      let p: PassengerVerifyDto
      if (tab === 0) {
        p = await agentApi.verifyQr(accessToken, tid, qrToken.trim())
      } else if (tab === 1) {
        p = await agentApi.verifyReference(accessToken, tid, bookingRef.trim())
      } else {
        p = await agentApi.verifyPhone(accessToken, tid, bookingRef.trim(), phone.trim())
      }
      setResult(p)
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Verify ticket
      </Typography>
      <Typography color="text.secondary">POST verify endpoints for the active trip.</Typography>

      <TextField label="Trip ID" value={tripId} onChange={(e) => setTripId(e.target.value)} fullWidth />

      <Card variant="outlined">
        <CardContent sx={{ p: 0 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab label="QR token" />
            <Tab label="Reference" />
            <Tab label="Ref + phone" />
          </Tabs>
          <Box sx={{ p: 2 }}>
            {tab === 0 && (
              <Stack spacing={2}>
                <TextField
                  label="QR payload (verificationToken)"
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Button variant="contained" disabled={loading} onClick={() => void run()}>
                  Verify
                </Button>
              </Stack>
            )}
            {tab === 1 && (
              <Stack spacing={2}>
                <TextField label="Booking reference" value={bookingRef} onChange={(e) => setBookingRef(e.target.value)} fullWidth />
                <Button variant="contained" disabled={loading} onClick={() => void run()}>
                  Verify
                </Button>
              </Stack>
            )}
            {tab === 2 && (
              <Stack spacing={2}>
                <TextField label="Booking reference" value={bookingRef} onChange={(e) => setBookingRef(e.target.value)} fullWidth />
                <TextField label="Passenger phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
                <Button variant="contained" disabled={loading} onClick={() => void run()}>
                  Verify
                </Button>
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}

      {result && (
        <Card sx={{ bgcolor: 'success.main', color: 'common.white' }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleIcon />
              <Typography sx={{ fontWeight: 700 }}>
                {result.name} · Seat {result.seat} · {result.boardingStatus}
              </Typography>
            </Stack>
            <Chip sx={{ mt: 1 }} label={`Passenger #${result.id}`} color="success" />
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}
