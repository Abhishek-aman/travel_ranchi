import { useEffect, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled'
import { alpha, useTheme } from '@mui/material/styles'
import * as publicApi from '../../api/publicApi'
import type { RouteDto, TripDto } from '../../api/types'
import { DEFAULT_FARE_PER_SEAT } from '../../config'
import { useBooking } from '../../context/useBooking'
import { ApiError } from '../../api/http'

const BUS_LABEL: Record<string, string> = {
  SEATER_2X2: 'Seater',
  SEATER_2X3: 'Seater',
  SLEEPER: 'Sleeper',
  HYBRID: 'Seater + sleeper',
}

function statusChipColor(status: TripDto['status']): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'SCHEDULED':
      return 'success'
    case 'IN_PROGRESS':
      return 'primary'
    case 'COMPLETED':
      return 'default'
    case 'CANCELLED':
      return 'error'
    default:
      return 'default'
  }
}

function statusLabel(status: TripDto['status']): string {
  switch (status) {
    case 'SCHEDULED':
      return 'Scheduled'
    case 'IN_PROGRESS':
      return 'In progress'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}

function formatDeparture(iso: string) {
  const d = new Date(iso)
  return {
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    full: d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

export function SearchPage() {
  const theme = useTheme()
  const [params] = useSearchParams()
  const origin = params.get('origin') ?? 'Mumbai'
  const destination = params.get('destination') ?? 'Pune'
  const date = params.get('date') ?? ''
  const { setBooking } = useBooking()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routes, setRoutes] = useState<RouteDto[]>([])
  const [sections, setSections] = useState<{ route: RouteDto; trips: TripDto[] }[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!date) {
        setLoading(false)
        setRoutes([])
        setSections([])
        return
      }
      setLoading(true)
      setError(null)
      try {
        const r = await publicApi.searchRoutes(origin, destination)
        if (cancelled) return
        setRoutes(r)
        const next: { route: RouteDto; trips: TripDto[] }[] = []
        for (const route of r) {
          const trips = await publicApi.listTripsForRoute(route.id, date)
          if (cancelled) return
          next.push({ route, trips })
        }
        setSections(next)
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Failed to load trips')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [origin, destination, date])

  const selectTrip = (route: RouteDto, trip: TripDto) => {
    setBooking({
      tripId: trip.id,
      routeId: route.id,
      origin: route.origin,
      destination: route.destination,
      tripDate: trip.tripDate,
      departureAt: trip.departureAt,
      tripStatus: trip.status,
      selectedSeats: [],
    })
  }

  const tripCount = sections.reduce((a, s) => a + s.trips.length, 0)

  const dateHeading =
    date && !Number.isNaN(Date.parse(date))
      ? new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      : 'Pick a date on home'

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '60vh' }}>
      <Box
        sx={{
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 100%)`,
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 3, md: 4 },
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit" fontWeight={500}>
              Home
            </Link>
            <Typography color="text.primary" fontWeight={600}>
              Results
            </Typography>
          </Breadcrumbs>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'flex-end' }}>
            <Box>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1 }}>
                Your search
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5, mt: 0.5 }}>
                {origin} → {destination}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1 }} useFlexGap>
                <Typography color="text.secondary" sx={{ fontSize: '1.05rem' }}>
                  {dateHeading}
                </Typography>
                {date && !loading && (
                  <Chip
                    size="small"
                    label={tripCount === 0 ? 'No departures' : `${tripCount} departure${tripCount === 1 ? '' : 's'}`}
                    color={tripCount === 0 ? 'default' : 'primary'}
                    variant={tripCount === 0 ? 'outlined' : 'filled'}
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading && (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Finding buses…
            </Typography>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !date && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Add a travel date from the home page to load trips.
          </Alert>
        )}

        {!loading && date && routes.length === 0 && !error && (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              No routes found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
              Try different city names or spellings that match your network.
            </Typography>
            <Button component={RouterLink} to="/" variant="contained" size="large">
              Change search
            </Button>
          </Paper>
        )}

        <Stack spacing={5}>
          {sections.map(({ route, trips }) => (
            <Box key={route.id}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  borderColor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                <Box
                  sx={{
                    px: { xs: 2, sm: 2.5 },
                    py: 1.75,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <DirectionsBusFilledIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {route.operatorCode ? `${route.operatorCode} · ` : ''}
                        Usual departure {route.departureTime}
                        {route.distanceKm != null ? ` · ~${route.distanceKm} km` : ''}
                      </Typography>
                    </Stack>
                    {sections.length > 1 && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {route.origin} → {route.destination}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Stack spacing={0} divider={<Divider flexItem sx={{ mx: { xs: 0, sm: 2 } }} />}>
                  {trips.length === 0 && (
                    <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No buses on this date for this service. Try another day or route.
                      </Typography>
                    </Box>
                  )}
                  {trips.map((trip) => {
                    const q = new URLSearchParams(params)
                    q.set('routeId', String(route.id))
                    const tripHref = `/trip/${trip.id}?${q.toString()}`
                    const { time, full } = formatDeparture(trip.departureAt)
                    const fare = trip.farePerSeat ?? DEFAULT_FARE_PER_SEAT
                    const busLabel = trip.busType ? BUS_LABEL[trip.busType] ?? trip.busType : null

                    return (
                      <CardContent key={trip.id} sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          spacing={3}
                          sx={{
                            p: { xs: 2, sm: 2.5 },
                            alignItems: { md: 'center' },
                            justifyContent: 'space-between',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                            },
                          }}
                        >
                          <Stack direction="row" spacing={2.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                              sx={{
                                width: 72,
                                height: 72,
                                borderRadius: 2,
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.09),
                                color: 'primary.main',
                              }}
                            >
                              <AccessTimeIcon sx={{ fontSize: 20, opacity: 0.85 }} />
                              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 0.25 }}>
                                {time}
                              </Typography>
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                  Departure
                                </Typography>
                                <Chip size="small" label={statusLabel(trip.status)} color={statusChipColor(trip.status)} variant="outlined" />
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                                {full}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {busLabel && (
                                  <Chip size="small" label={busLabel} variant="outlined" sx={{ height: 24 }} />
                                )}
                                <Typography variant="caption" color="text.disabled">
                                  Trip ref · {trip.id}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>

                          <Stack
                            direction={{ xs: 'row', md: 'column' }}
                            spacing={2}
                            alignItems={{ xs: 'center', md: 'flex-end' }}
                            sx={{ flexShrink: 0 }}
                          >
                            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                From
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                ₹{fare}
                                <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  {' '}
                                  / seat
                                </Typography>
                              </Typography>
                              {!trip.farePerSeat && (
                                <Typography variant="caption" color="text.disabled">
                                  Est. — confirm at checkout
                                </Typography>
                              )}
                            </Box>
                            <Button
                              component={RouterLink}
                              to={tripHref}
                              variant="contained"
                              size="large"
                              sx={{ minWidth: { xs: '100%', sm: 200 }, px: 3 }}
                              onClick={() => selectTrip(route, trip)}
                            >
                              Select seats
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    )
                  })}
                </Stack>
              </Paper>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  )
}
