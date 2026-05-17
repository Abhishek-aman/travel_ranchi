import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import * as publicApi from '../../api/publicApi'
import * as agentApi from '../../api/agentApi'
import type { TripSeatDto } from '../../api/types'
import { ApiSeatPicker } from '../../components/ApiSeatPicker'
import { useAuth } from '../../auth/useAuth'
import { DEFAULT_FARE_PER_SEAT } from '../../config'
import { ApiError } from '../../api/http'

export function AgentTripBookPage() {
  const { tripId = '' } = useParams()
  return <AgentTripBookInner key={tripId} tripId={tripId} />
}

function AgentTripBookInner({ tripId }: { tripId: string }) {
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const tripIdNum = Number(tripId)

  const [seats, setSeats] = useState<TripSeatDto[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [done, setDone] = useState(false)
  const [ref, setRef] = useState<string | null>(null)
  const [loadingSeats, setLoadingSeats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(tripIdNum)) return
    let c = false
    ;(async () => {
      setLoadingSeats(true)
      setError(null)
      try {
        const s = await publicApi.listTripSeats(tripIdNum)
        if (!c) setSeats(s)
      } catch (e: unknown) {
        if (!c) setError(e instanceof ApiError ? e.message : 'Failed to load seats')
      } finally {
        if (!c) setLoadingSeats(false)
      }
    })()
    return () => {
      c = true
    }
  }, [tripIdNum])

  const toggle = (seat: TripSeatDto) => {
    setSelected((s) => (s.includes(seat.id) ? s.filter((x) => x !== seat.id) : [...s, seat.id]))
  }

  const selectedSeats = useMemo(() => seats.filter((s) => selected.includes(s.id)), [seats, selected])

  const total = DEFAULT_FARE_PER_SEAT * selected.length

  const issue = async () => {
    if (!accessToken || !Number.isFinite(tripIdNum)) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await agentApi.createAgentBooking(accessToken, {
        tripId: tripIdNum,
        tripSeatIds: selected,
        passengers: selectedSeats.map(() => ({ name: name.trim(), phone: phone.trim() })),
        totalAmount: total,
      })
      setRef(res.bookingReference)
      setDone(true)
      window.setTimeout(() => navigate('/agent'), 2500)
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!Number.isFinite(tripIdNum)) {
    return <Typography>Invalid trip</Typography>
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Cash booking
      </Typography>
      <Typography color="text.secondary">Trip #{tripIdNum}</Typography>

      {loadingSeats && <CircularProgress size={28} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loadingSeats && (
        <ApiSeatPicker
          seats={seats}
          selectedTripSeatIds={selected}
          onToggle={(seat) => toggle(seat)}
        />
      )}

      <Card variant="outlined">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Passenger name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required fullWidth />
          <Typography variant="caption" color="text.secondary">
            Multi-seat: same contact applied to each seat (extend UI if you need per-seat names).
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 700 }}>Collect cash</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              ₹{total}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="large"
            disabled={selected.length === 0 || !name || !phone || submitting}
            onClick={() => void issue()}
          >
            Issue ticket
          </Button>
          {done && ref && (
            <Alert severity="success">
              Confirmed · {ref}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
