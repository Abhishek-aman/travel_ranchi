import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddRoadIcon from '@mui/icons-material/AddRoad'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import ExploreIcon from '@mui/icons-material/Explore'
import SearchIcon from '@mui/icons-material/Search'
import { alpha, useTheme } from '@mui/material/styles'
import * as adminApi from '../../api/adminApi'
import * as publicApi from '../../api/publicApi'
import type { RouteDto, TripDto } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../api/http'

function toIsoFromLocalDatetime(local: string): string {
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return local
  return d.toISOString()
}

function localDateTimeAt(h: number, m: number): string {
  const d = new Date()
  d.setSeconds(0, 0)
  d.setHours(h, m, 0, 0)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${mo}-${day}T${hh}:${mm}`
}

function localDateTimeTomorrowAt(h: number, m: number): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setSeconds(0, 0)
  d.setHours(h, m, 0, 0)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${mo}-${day}T${hh}:${mm}`
}

const GUIDE = [
  {
    icon: <ExploreIcon color="primary" />,
    title: 'Find routes',
    body: 'See which city pairs already exist in the network—the same options travellers get when they search for tickets.',
  },
  {
    icon: <AddRoadIcon color="primary" />,
    title: 'Add a route',
    body: 'Register a new corridor with distance and a typical departure time. You need a route before you can plan trips on it.',
  },
  {
    icon: <CalendarMonthIcon color="primary" />,
    title: 'Check departures',
    body: 'Pick a route and a calendar day to see what is already scheduled, or spot days with no bus yet.',
  },
  {
    icon: <DirectionsBusFilledIcon color="primary" />,
    title: 'Schedule a trip',
    body: 'Assign one of your registered buses to a route for a specific day, with real departure and arrival times.',
  },
] as const

export function AdminRoutesPage() {
  const theme = useTheme()
  const { accessToken } = useAuth()

  const [searchOrigin, setSearchOrigin] = useState('Mumbai')
  const [searchDestination, setSearchDestination] = useState('Pune')
  const [routes, setRoutes] = useState<RouteDto[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const [operatorCode, setOperatorCode] = useState('DEMO')
  const [origin, setOrigin] = useState('Mumbai')
  const [destination, setDestination] = useState('Goa')
  const [distanceKm, setDistanceKm] = useState(600)
  const [departureTime, setDepartureTime] = useState('21:00')
  const [createLoading, setCreateLoading] = useState(false)
  const [createMsg, setCreateMsg] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const [tripsOpen, setTripsOpen] = useState(false)
  const [tripsRoute, setTripsRoute] = useState<RouteDto | null>(null)
  const [tripDate, setTripDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [trips, setTrips] = useState<TripDto[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)
  const [tripsError, setTripsError] = useState<string | null>(null)

  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleRouteId, setScheduleRouteId] = useState<number | null>(null)
  const [busId, setBusId] = useState('1')
  const [scheduleTripDate, setScheduleTripDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [departureLocal, setDepartureLocal] = useState(() => localDateTimeAt(21, 0))
  const [arrivalLocal, setArrivalLocal] = useState(() => localDateTimeTomorrowAt(6, 0))
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleMsg, setScheduleMsg] = useState<string | null>(null)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  const runSearch = async () => {
    setSearchLoading(true)
    setSearchError(null)
    try {
      const r = await publicApi.searchRoutes(searchOrigin.trim(), searchDestination.trim())
      setRoutes(r)
      setHasSearched(true)
    } catch (e: unknown) {
      setSearchError(e instanceof ApiError ? e.message : 'Search failed')
      setRoutes([])
    } finally {
      setSearchLoading(false)
    }
  }

  const submitCreate = async () => {
    if (!accessToken) return
    setCreateLoading(true)
    setCreateError(null)
    setCreateMsg(null)
    try {
      const res = await adminApi.createRoute(accessToken, {
        operatorCode,
        origin,
        destination,
        distanceKm,
        departureTime,
      })
      const id = typeof res.id === 'number' ? ` Reference #${res.id}.` : ''
      setCreateMsg(`Route added.${id}`)
      if (hasSearched) void runSearch()
    } catch (e: unknown) {
      setCreateError(e instanceof ApiError ? e.message : 'Failed to create route')
    } finally {
      setCreateLoading(false)
    }
  }

  const openTrips = (route: RouteDto) => {
    setTripsRoute(route)
    setTrips([])
    setTripsError(null)
    setTripsOpen(true)
    void loadTripsForRoute(route.id, tripDate)
  }

  const loadTripsForRoute = async (routeId: number, date: string) => {
    setTripsLoading(true)
    setTripsError(null)
    try {
      const t = await publicApi.listTripsForRoute(routeId, date)
      setTrips(t)
    } catch (e: unknown) {
      setTripsError(e instanceof ApiError ? e.message : 'Failed to load trips')
      setTrips([])
    } finally {
      setTripsLoading(false)
    }
  }

  const openSchedule = (routeId: number) => {
    setScheduleRouteId(routeId)
    setScheduleTripDate(tripDate)
    setScheduleMsg(null)
    setScheduleError(null)
    setScheduleOpen(true)
  }

  const submitSchedule = async () => {
    if (!accessToken || scheduleRouteId == null) return
    const bid = Number(busId)
    if (!Number.isFinite(bid)) {
      setScheduleError('Enter a valid bus id.')
      return
    }
    setScheduleLoading(true)
    setScheduleError(null)
    setScheduleMsg(null)
    try {
      await adminApi.createTrip(accessToken, {
        routeId: scheduleRouteId,
        busId: bid,
        tripDate: scheduleTripDate,
        departureAt: toIsoFromLocalDatetime(departureLocal),
        arrivalAt: toIsoFromLocalDatetime(arrivalLocal),
      })
      setScheduleMsg('Trip saved. Passengers can book seats once inventory is live.')
      if (tripsRoute && tripsRoute.id === scheduleRouteId) {
        void loadTripsForRoute(scheduleRouteId, scheduleTripDate)
      }
      if (hasSearched) void runSearch()
    } catch (e: unknown) {
      setScheduleError(e instanceof ApiError ? e.message : 'Failed to create trip')
    } finally {
      setScheduleLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.07)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5, color: 'text.primary' }}>
          Routes & schedules
        </Typography>
        <Typography variant="body1" sx={{ mt: 1.5, color: 'text.secondary', maxWidth: 720, lineHeight: 1.65 }}>
          Decide where your buses can run and when they leave. Start by looking up what is already in the system, add new
          corridors if needed, then plan individual departures by hooking a bus to a route on a specific day.
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {GUIDE.map((item) => (
          <Paper
            key={item.title}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              height: '100%',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box sx={{ pt: 0.25 }}>{item.icon}</Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                  {item.body}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: '1fr minmax(320px, 400px)' },
          alignItems: 'start',
        }}
      >
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }}
        >
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <SearchIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Route directory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search by origin and destination to review corridors and plan next steps.
                </Typography>
              </Box>
            </Stack>
          </Box>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                border: '1px dashed',
                borderColor: alpha(theme.palette.primary.main, 0.15),
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <TextField
                  label="From"
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="City"
                />
                <TextField
                  label="To"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="City"
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={searchLoading ? undefined : <SearchIcon />}
                  onClick={() => void runSearch()}
                  disabled={searchLoading}
                  sx={{
                    flexShrink: 0,
                    alignSelf: { xs: 'stretch', sm: 'auto' },
                    minHeight: 40,
                    px: 2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {searchLoading ? <CircularProgress size={20} color="inherit" /> : 'Search routes'}
                </Button>
              </Stack>
            </Paper>

            {searchError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {searchError}
              </Alert>
            )}
            {hasSearched && !searchLoading && routes.length === 0 && !searchError && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No routes matched. Try different city names, or add a new corridor using the form on the right.
              </Alert>
            )}
            {routes.length > 0 && (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  maxHeight: 440,
                  borderRadius: 2,
                  borderColor: 'divider',
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>Route</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                        Usual departure
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                        Operator
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                        Distance
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routes.map((r) => (
                      <TableRow key={r.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: alpha(theme.palette.action.hover, 0.35) } }}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip size="small" label={`#${r.id}`} variant="outlined" sx={{ fontWeight: 600 }} />
                            <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                              {r.origin}
                            </Typography>
                            <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                            <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                              {r.destination}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{r.departureTime}</TableCell>
                        <TableCell align="right">{r.operatorCode ?? '—'}</TableCell>
                        <TableCell align="right">{r.distanceKm != null ? `${r.distanceKm} km` : '—'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="See departures on a chosen day">
                            <IconButton size="small" color="primary" onClick={() => openTrips(r)} aria-label="View departures for route">
                              <CalendarMonthIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Plan a new departure with a bus you registered">
                            <IconButton size="small" color="secondary" onClick={() => openSchedule(r.id)} aria-label="Schedule a trip">
                              <EventAvailableIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            position: { lg: 'sticky' },
            top: { lg: 88 },
            borderColor: alpha(theme.palette.secondary.main, 0.35),
            bgcolor: alpha(theme.palette.secondary.main, 0.04),
          }}
        >
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.secondary.main, 0.2),
                }}
              >
                <AddRoadIcon sx={{ color: 'secondary.dark' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Add a new route
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Define a corridor travellers can book once trips are scheduled.
                </Typography>
              </Box>
            </Stack>
          </Box>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {createMsg && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                {createMsg}
              </Alert>
            )}
            {createError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {createError}
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                label="Operator code"
                value={operatorCode}
                onChange={(e) => setOperatorCode(e.target.value)}
                fullWidth
                size="small"
                helperText="Your brand or fleet short code"
              />
              <TextField label="From city" value={origin} onChange={(e) => setOrigin(e.target.value)} fullWidth size="small" />
              <TextField label="To city" value={destination} onChange={(e) => setDestination(e.target.value)} fullWidth size="small" />
              <TextField
                label="Distance"
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                fullWidth
                size="small"
                InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
              />
              <TextField
                label="Typical departure time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                fullWidth
                size="small"
                helperText="Shown as the usual time of day for this corridor (24h format)"
              />
              <Button variant="contained" color="secondary" fullWidth size="large" onClick={() => void submitCreate()} disabled={createLoading}>
                {createLoading ? 'Saving…' : 'Save route'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.primary.main, 0.03),
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
          <strong>Before scheduling trips,</strong> register buses and seat layouts under{' '}
          <Link component={RouterLink} to="/admin/buses" fontWeight={600}>
            Buses & layouts
          </Link>
          . To hold or release seats on a running service, use{' '}
          <Link component={RouterLink} to="/admin/inventory" fontWeight={600}>
            Inventory
          </Link>
          .
        </Typography>
      </Paper>

      <Divider sx={{ opacity: 0.6 }} />

      <Dialog open={tripsOpen} onClose={() => setTripsOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 0.5 }}>
          Departures on this route
          {tripsRoute ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 400 }}>
              {tripsRoute.origin} → {tripsRoute.destination}
              <Chip size="small" label={`Route #${tripsRoute.id}`} sx={{ ml: 1 }} variant="outlined" />
            </Typography>
          ) : null}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose a date to list buses already assigned to this corridor. Empty days are a good cue to schedule something new.
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Date"
              type="date"
              value={tripDate}
              onChange={(e) => {
                const d = e.target.value
                setTripDate(d)
                if (tripsRoute) void loadTripsForRoute(tripsRoute.id, d)
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
            {tripsLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={32} />
              </Box>
            )}
            {tripsError && <Alert severity="error">{tripsError}</Alert>}
            {!tripsLoading && trips.length === 0 && !tripsError && (
              <Typography color="text.secondary">Nothing scheduled for this day yet. Use “Schedule a trip” to add one.</Typography>
            )}
            {trips.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Trip</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Departs</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trips.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>#{t.id}</TableCell>
                        <TableCell>{t.departureAt}</TableCell>
                        <TableCell>
                          <Chip label={t.status} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTripsOpen(false)}>Close</Button>
          {tripsRoute && (
            <Button variant="contained" onClick={() => openSchedule(tripsRoute.id)}>
              Schedule a trip
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 0.5 }}>Schedule a trip</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Link a bus you have already registered to route <strong>#{scheduleRouteId ?? '—'}</strong>. Bus ids are listed under{' '}
            <Link component={RouterLink} to="/admin/buses">
              Buses & layouts
            </Link>
            .
          </Typography>
          {scheduleMsg && <Alert severity="success">{scheduleMsg}</Alert>}
          {scheduleError && (
            <Alert severity="error" sx={{ mt: scheduleMsg ? 1 : 0 }}>
              {scheduleError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Bus"
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              fullWidth
              size="small"
              required
              helperText="Internal id of the vehicle (from your fleet list)"
            />
            <TextField
              label="Service date"
              type="date"
              value={scheduleTripDate}
              onChange={(e) => setScheduleTripDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Leaves at"
              type="datetime-local"
              value={departureLocal}
              onChange={(e) => setDepartureLocal(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Arrives at"
              type="datetime-local"
              value={arrivalLocal}
              onChange={(e) => setArrivalLocal(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void submitSchedule()} disabled={scheduleLoading}>
            {scheduleLoading ? 'Saving…' : 'Save trip'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
