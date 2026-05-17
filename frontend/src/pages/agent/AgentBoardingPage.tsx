import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import * as agentApi from '../../api/agentApi'
import type { PassengerVerifyDto } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../api/http'

export function AgentBoardingPage() {
  const { tripId: tripIdParam = '' } = useParams()
  const { accessToken } = useAuth()
  const tripIdNum = Number(tripIdParam)

  const [rows, setRows] = useState<PassengerVerifyDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)

  const load = async () => {
    if (!accessToken || !Number.isFinite(tripIdNum)) return
    setLoading(true)
    setError(null)
    try {
      const m = await agentApi.getTripManifest(accessToken, tripIdNum)
      setRows(m)
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Failed to load manifest')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load manifest on trip change
    void load()
  }, [accessToken, tripIdNum])

  const noShow = async (id: number) => {
    if (!accessToken) return
    setActionId(id)
    try {
      await agentApi.markNoShow(accessToken, id)
      await load()
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Update failed')
    } finally {
      setActionId(null)
    }
  }

  const offboard = async (id: number) => {
    if (!accessToken) return
    setActionId(id)
    try {
      await agentApi.markOffboard(accessToken, id)
      await load()
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Update failed')
    } finally {
      setActionId(null)
    }
  }

  if (!Number.isFinite(tripIdNum)) {
    return <Typography>Invalid trip id in URL.</Typography>
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Manifest · trip #{tripIdNum}
      </Typography>
      <Typography color="text.secondary">GET /api/agent/trips/&#123;id&#125;/manifest · PATCH no-show / offboard</Typography>

      {loading && (
        <Stack alignItems="center">
          <CircularProgress size={28} />
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      <Button variant="outlined" size="small" onClick={() => void load()} disabled={loading}>
        Refresh
      </Button>

      {rows.map((p) => (
        <Card key={p.id} variant="outlined">
          <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
            <div>
              <Typography sx={{ fontWeight: 800 }}>
                {p.name} · Seat {p.seat}
              </Typography>
              <Chip size="small" label={p.boardingStatus} sx={{ mt: 0.5 }} />
            </div>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" disabled={actionId === p.id} onClick={() => void noShow(p.id)}>
                No-show
              </Button>
              <Button size="small" variant="contained" disabled={actionId === p.id} onClick={() => void offboard(p.id)}>
                Offboarded
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ))}

      {!loading && rows.length === 0 && !error && (
        <Typography color="text.secondary">No passengers on this manifest.</Typography>
      )}
    </Stack>
  )
}
