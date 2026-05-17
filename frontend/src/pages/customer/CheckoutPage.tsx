import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import PaymentIcon from '@mui/icons-material/Payment'
import * as customerApi from '../../api/customerApi'
import { useBooking } from '../../context/useBooking'
import { useAuth } from '../../auth/useAuth'
import { DEFAULT_FARE_PER_SEAT } from '../../config'
import { ApiError } from '../../api/http'

export function CheckoutPage() {
  const navigate = useNavigate()
  const {
    customerAccessToken,
    ensureGuestCustomer,
    guestSessionError,
    guestSessionLoading,
    hasRole,
  } = useAuth()
  const { booking, setBooking, reset } = useBooking()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passengers, setPassengers] = useState<{ name: string; phone: string }[]>([])

  useEffect(() => {
    void ensureGuestCustomer()
  }, [ensureGuestCustomer])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- align passenger rows with selected seats
    setPassengers(booking.selectedSeats.map(() => ({ name: '', phone: '' })))
  }, [booking.selectedSeats])

  const customerReady = Boolean(customerAccessToken && hasRole('CUSTOMER'))

  if (!booking.tripId || booking.selectedSeats.length === 0) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography>Your session expired. Start from search.</Typography>
        <Button component={RouterLink} to="/" sx={{ mt: 2 }}>
          Home
        </Button>
      </Container>
    )
  }

  if (guestSessionLoading && !customerAccessToken) {
    return (
      <Container sx={{ py: 8 }} maxWidth="md">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Preparing secure checkout…</Typography>
        </Stack>
      </Container>
    )
  }

  if (!customerReady) {
    return (
      <Container sx={{ py: 6 }} maxWidth="md">
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Checkout unavailable
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {guestSessionError ??
            'A guest customer token is required. Implement POST /api/auth/guest-customer on your API (same token payload as login).'}
        </Alert>
        <Button component={RouterLink} to="/search" variant="outlined">
          Back to results
        </Button>
      </Container>
    )
  }

  const total = DEFAULT_FARE_PER_SEAT * booking.selectedSeats.length

  const updatePassenger = (index: number, field: 'name' | 'phone', value: string) => {
    setPassengers((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const pay = async () => {
    if (!customerAccessToken) return
    setError(null)
    setLoading(true)
    try {
      if (!booking.tripId) return
      const createRes = await customerApi.createBooking(customerAccessToken, {
        tripId: booking.tripId,
        tripSeatIds: booking.selectedSeats.map((s) => s.tripSeatId),
        passengers: passengers.map((p) => ({ name: p.name.trim(), phone: p.phone.trim() })),
        totalAmount: total,
      })
      await customerApi.confirmPayment(customerAccessToken, createRes.bookingReference, {
        paymentGatewayRef: `mock_${Date.now()}`,
      })
      setBooking({
        bookingReference: createRes.bookingReference,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
      })
      navigate('/confirmation')
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const valid =
    passengers.length === booking.selectedSeats.length &&
    passengers.every((p) => p.name.trim() && p.phone.trim())

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Home
        </Link>
        <Typography color="text.primary">Checkout</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        Passengers & payment
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Guest checkout — no account required. Creates booking (PENDING_PAYMENT), then confirms mock gateway payment.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        <Card variant="outlined" sx={{ flex: 1, width: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Passengers (one per seat)
            </Typography>
            <Stack spacing={3}>
              {booking.selectedSeats.map((seat, index) => (
                <Card key={seat.tripSeatId} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Seat {seat.label}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      required
                      label="Full name"
                      value={passengers[index]?.name ?? ''}
                      onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                    />
                    <TextField
                      required
                      label="Phone"
                      value={passengers[index]?.phone ?? ''}
                      onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                    />
                  </Stack>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ width: '100%', maxWidth: { md: 380 } }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Trip summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.origin} → {booking.destination}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Trip #{booking.tripId}
              {booking.departureAt && ` · ${new Date(booking.departureAt).toLocaleString()}`}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Seats: {booking.selectedSeats.map((s) => s.label).join(', ')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography>Total</Typography>
              <Typography sx={{ fontWeight: 800 }}>₹{total}</Typography>
            </Stack>
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              startIcon={<PaymentIcon />}
              disabled={loading || !valid}
              onClick={pay}
            >
              {loading ? 'Processing…' : 'Pay with gateway (mock)'}
            </Button>
            <Button fullWidth sx={{ mt: 1 }} color="inherit" onClick={() => reset()}>
              Clear booking
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  )
}
