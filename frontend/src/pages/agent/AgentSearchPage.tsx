import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import * as publicApi from '../../api/publicApi'
import type { RouteDto, TripDto } from '../../api/types'
import { ApiError } from '../../api/http'

export function AgentSearchPage() {
  const [origin, setOrigin] = useState('Mumbai')
  const [destination, setDestination] = useState('Pune')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<{ route: RouteDto; trips: TripDto[] }[]>([])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const routes = await publicApi.searchRoutes(origin, destination)
      const next: { route: RouteDto; trips: TripDto[] }[] = []
      for (const route of routes) {
        const trips = await publicApi.listTripsForRoute(route.id, date)
        next.push({ route, trips })
      }
      setSections(next)
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial trip search
    void load()
  }, [])

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Book for passenger
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField label="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} fullWidth />
        <TextField label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} fullWidth />
        <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} fullWidth />
      </Stack>
      <Button variant="outlined" onClick={() => void load()} disabled={loading}>
        Search
      </Button>
      {loading && (
        <Stack alignItems="center">
          <CircularProgress size={32} />
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {sections.flatMap((s) => s.trips).length === 0 && !loading && !error && (
        <Typography color="text.secondary">No trips. Adjust search and tap Search.</Typography>
      )}
      {sections.map(({ route, trips }) =>
        trips.map((t) => (
          <Card key={`${route.id}-${t.id}`} variant="outlined">
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <div>
                <Typography sx={{ fontWeight: 700 }}>
                  {route.origin} → {route.destination} · Trip #{t.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(t.departureAt).toLocaleString()} · {t.status}
                </Typography>
              </div>
              <Button component={RouterLink} to={`/agent/trip/${t.id}`} variant="contained">
                Select
              </Button>
            </CardContent>
          </Card>
        )),
      )}
    </Stack>
  )
}
