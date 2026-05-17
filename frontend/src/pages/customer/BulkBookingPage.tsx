import { useState } from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import * as publicApi from '../../api/publicApi'
import type { RouteDto } from '../../api/types'
import { ApiError } from '../../api/http'

export function BulkBookingPage() {
  const [sent, setSent] = useState(false)
  const [refCode, setRefCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [routesLoading, setRoutesLoading] = useState(false)
  const [routes, setRoutes] = useState<RouteDto[]>([])
  const [origin, setOrigin] = useState('Mumbai')
  const [destination, setDestination] = useState('Pune')

  const [requesterName, setRequesterName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [routeId, setRouteId] = useState<number | ''>('')
  const [tripDate, setTripDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [requestedSeats, setRequestedSeats] = useState(20)
  const [notes, setNotes] = useState('')

  const searchRoutes = async () => {
    setRoutesLoading(true)
    setError(null)
    try {
      const r = await publicApi.searchRoutes(origin, destination)
      setRoutes(r)
      setRouteId(r[0]?.id ?? '')
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Failed to load routes')
    } finally {
      setRoutesLoading(false)
    }
  }

  const submit = async () => {
    setError(null)
    if (routeId === '') {
      setError('Pick a route (search routes first).')
      return
    }
    setLoading(true)
    try {
      const res = await publicApi.submitBulkBookingRequest({
        requesterName,
        email,
        phone,
        routeId: routeId as number,
        tripDate,
        requestedSeats,
        notes: notes || undefined,
      })
      setRefCode(`BKR-${res.id}`)
      setSent(true)
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        Group & bulk travel
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        POST /api/public/bulk-booking-requests — admin approves in the console.
      </Typography>

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          {sent && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Request received. Ref: {refCode} (status PENDING)
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2}>
            <TextField label="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} fullWidth />
            <TextField label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} fullWidth />
            <Button variant="outlined" onClick={() => void searchRoutes()} disabled={routesLoading}>
              {routesLoading ? <CircularProgress size={20} /> : 'Search routes'}
            </Button>
            <TextField
              select
              label="Route"
              value={routeId}
              onChange={(e) => setRouteId(Number(e.target.value))}
              fullWidth
              disabled={!routes.length}
            >
              {routes.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.origin} → {r.destination} (#{r.id}) · {r.departureTime}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Organization / requester" required value={requesterName} onChange={(e) => setRequesterName(e.target.value)} fullWidth />
            <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField label="Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            <TextField label="Travel date" type="date" InputLabelProps={{ shrink: true }} value={tripDate} onChange={(e) => setTripDate(e.target.value)} fullWidth />
            <TextField
              label="Approx. seats"
              type="number"
              value={requestedSeats}
              onChange={(e) => setRequestedSeats(Number(e.target.value))}
              fullWidth
            />
            <TextField label="Notes" multiline minRows={3} value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth />
            <Button variant="contained" size="large" onClick={() => void submit()} disabled={sent || loading}>
              {loading ? 'Submitting…' : 'Submit request'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
