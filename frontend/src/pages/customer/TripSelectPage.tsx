import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import * as publicApi from '../../api/publicApi'
import type { TripSeatDto } from '../../api/types'
import { ApiSeatPicker } from '../../components/ApiSeatPicker'
import { useBooking } from '../../context/useBooking'
import { DEFAULT_FARE_PER_SEAT } from '../../config'
import { ApiError } from '../../api/http'

export function TripSelectPage() {
  const { tripId: tripIdParam = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { booking, setBooking, toggleSeat } = useBooking()

  const tripIdNum = Number(tripIdParam)
  const validTrip = Number.isFinite(tripIdNum)
  const [seats, setSeats] = useState<TripSeatDto[]>([])
  const [loading, setLoading] = useState(() => validTrip)
  const [error, setError] = useState<string | null>(null)

  const origin = searchParams.get('origin') ?? booking.origin
  const destination = searchParams.get('destination') ?? booking.destination
  const date = searchParams.get('date') ?? booking.tripDate
  const routeIdParam = searchParams.get('routeId')

  useEffect(() => {
    if (!validTrip) return
    setBooking((b) => {
      const rid = routeIdParam ? Number(routeIdParam) : b.routeId
      return {
        ...b,
        tripId: tripIdNum,
        routeId: Number.isFinite(rid as number) ? (rid as number) : b.routeId,
        origin: origin || b.origin,
        destination: destination || b.destination,
        tripDate: date || b.tripDate,
      }
    })
  }, [tripIdNum, validTrip, routeIdParam, origin, destination, date, setBooking])

  useEffect(() => {
    if (!validTrip) return
    let cancelled = false
    ;(async () => {
      setError(null)
      try {
        const s = await publicApi.listTripSeats(tripIdNum)
        if (!cancelled) setSeats(s)
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Failed to load seats')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tripIdNum, validTrip])

  const selectedIds = useMemo(() => booking.selectedSeats.map((s) => s.tripSeatId), [booking.selectedSeats])

  const onToggle = (seat: TripSeatDto) => {
    toggleSeat({ tripSeatId: seat.id, label: seat.label })
  }

  const fare = DEFAULT_FARE_PER_SEAT * booking.selectedSeats.length

  const resultsLink = `/search?${new URLSearchParams({ origin, destination, date }).toString()}`

  if (!validTrip) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography>Invalid trip.</Typography>
        <Button component={RouterLink} to="/" sx={{ mt: 2 }}>
          Go home
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to={resultsLink} underline="hover" color="inherit">
          Results
        </Link>
        <Typography color="text.primary">Seats</Typography>
      </Breadcrumbs>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Choose seats
        </Typography>
        <Typography color="text.secondary">
          {origin} → {destination} · Trip #{tripIdNum}
          {booking.departureAt && ` · ${new Date(booking.departureAt).toLocaleString()}`}
        </Typography>
      </Stack>

      {loading && (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <ApiSeatPicker seats={seats} selectedTripSeatIds={selectedIds} onToggle={onToggle} />
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mt: 3 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {booking.selectedSeats.length} seat(s) · ₹{DEFAULT_FARE_PER_SEAT} each (configure VITE_FARE_PER_SEAT)
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Total ₹{fare}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          disabled={booking.selectedSeats.length === 0}
          onClick={() => navigate('/checkout')}
        >
          Continue
        </Button>
      </Stack>
    </Container>
  )
}
