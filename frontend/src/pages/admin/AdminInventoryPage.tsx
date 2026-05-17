import { useState } from 'react'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import * as adminApi from '../../api/adminApi'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../api/http'

export function AdminInventoryPage() {
  const { accessToken } = useAuth()
  const [tripId, setTripId] = useState('1')
  const [seatLabel, setSeatLabel] = useState('A1')
  const [reason, setReason] = useState('Maintenance')
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const tid = Number(tripId)

  const block = async () => {
    if (!accessToken || !Number.isFinite(tid)) return
    setLoading(true)
    setError(null)
    setMsg(null)
    try {
      await adminApi.blockSeat(accessToken, tid, seatLabel, reason)
      setMsg('Seat blocked.')
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const unblock = async () => {
    if (!accessToken || !Number.isFinite(tid)) return
    setLoading(true)
    setError(null)
    setMsg(null)
    try {
      await adminApi.unblockSeat(accessToken, tid, seatLabel)
      setMsg('Seat unblocked.')
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={2}>
      <div>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Block / unblock seat
        </Typography>
        <Typography color="text.secondary">POST /api/admin/trips/&#123;id&#125;/seats/block|unblock</Typography>
      </div>

      {msg && <Alert severity="success">{msg}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Card variant="outlined" sx={{ p: 2, maxWidth: 420 }}>
        <Stack spacing={2}>
          <TextField label="Trip ID" value={tripId} onChange={(e) => setTripId(e.target.value)} fullWidth />
          <TextField label="Seat label" value={seatLabel} onChange={(e) => setSeatLabel(e.target.value)} fullWidth />
          <TextField label="Reason (block only)" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="warning" onClick={() => void block()} disabled={loading}>
              Block
            </Button>
            <Button variant="outlined" onClick={() => void unblock()} disabled={loading}>
              Unblock
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}
