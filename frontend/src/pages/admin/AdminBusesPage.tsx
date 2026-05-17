import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled'
import RefreshIcon from '@mui/icons-material/Refresh'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import { alpha, useTheme } from '@mui/material/styles'
import * as adminApi from '../../api/adminApi'
import type { AdminBusDto, BusType } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../api/http'
import { LayoutSeatPreview } from '../../components/admin/LayoutSeatPreview'
import { formatLayoutJson, generateLayout, parseLayoutDocument } from '../../utils/busLayoutPresets'

const BUS_TYPE_LABEL: Record<BusType, string> = {
  SEATER_2X2: 'Seater 2+2 (with aisle)',
  SEATER_2X3: 'Seater 2+3',
  SLEEPER: 'Sleeper only',
  HYBRID: 'Seater + sleeper (mixed coach)',
}

const BUS_TYPE_HELP: Record<BusType, string> = {
  SEATER_2X2: 'Four seats per row with a gap in the middle for the aisle.',
  SEATER_2X3: 'Six seats in each row — common on express coaches.',
  SLEEPER: 'Two berths per row (lower and upper).',
  HYBRID:
    'Front half of the coach uses seater 2+2; the back half uses sleeper berths. Total “rows” sets overall length — roughly half seater, half sleeper.',
}

function coachLabel(busType: BusType | undefined): string {
  if (!busType) return '—'
  return BUS_TYPE_LABEL[busType] ?? busType
}

export function AdminBusesPage() {
  const theme = useTheme()
  const { accessToken } = useAuth()

  const [layoutTab, setLayoutTab] = useState(0)
  const [layoutName, setLayoutName] = useState('Standard 2+2')
  const [busType, setBusType] = useState<BusType>('SEATER_2X2')
  const [rowCount, setRowCount] = useState(10)
  const [layoutJson, setLayoutJson] = useState(() => formatLayoutJson(generateLayout('SEATER_2X2', 10)))

  const [layoutId, setLayoutId] = useState<number | ''>('')
  const [operatorCode, setOperatorCode] = useState('DEMO')
  const [registrationNumber, setRegistrationNumber] = useState('MH-02-CD-9999')

  const [layoutLoading, setLayoutLoading] = useState(false)
  const [busLoading, setBusLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [buses, setBuses] = useState<AdminBusDto[]>([])
  const [busesLoading, setBusesLoading] = useState(true)
  const [busesError, setBusesError] = useState<string | null>(null)

  const loadBuses = useCallback(async () => {
    if (!accessToken) return
    setBusesLoading(true)
    setBusesError(null)
    try {
      const list = await adminApi.listBuses(accessToken)
      setBuses(list)
    } catch (e: unknown) {
      setBusesError(e instanceof ApiError ? e.message : 'Could not load the bus list.')
      setBuses([])
    } finally {
      setBusesLoading(false)
    }
  }, [accessToken])

  /* eslint-disable react-hooks/set-state-in-effect -- load fleet when admin session is available */
  useEffect(() => {
    void loadBuses()
  }, [loadBuses])
  /* eslint-enable react-hooks/set-state-in-effect */

  const generatedJson = useMemo(() => formatLayoutJson(generateLayout(busType, rowCount)), [busType, rowCount])
  const effectiveLayoutJson = layoutTab === 0 ? generatedJson : layoutJson

  const handleLayoutTab = (_: SyntheticEvent, v: number) => {
    if (v === 1) setLayoutJson(generatedJson)
    setLayoutTab(v)
  }

  let previewSeats: { label: string; row: number; col: number }[] = []
  let previewError: string | null = null
  try {
    previewSeats = parseLayoutDocument(effectiveLayoutJson).seats
  } catch (e) {
    previewError = e instanceof Error ? e.message : 'Invalid layout'
  }

  const createLayout = async () => {
    if (!accessToken) return
    setLayoutLoading(true)
    setError(null)
    setMsg(null)
    try {
      parseLayoutDocument(effectiveLayoutJson)
      const res = await adminApi.createLayout(accessToken, {
        name: layoutName.trim() || 'Untitled layout',
        busType,
        layoutJson: effectiveLayoutJson,
      })
      setLayoutId(res.id)
      setMsg(`Layout saved. Template id ${res.id} — use it when you register the bus.`)
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed to create layout')
    } finally {
      setLayoutLoading(false)
    }
  }

  const createBus = async () => {
    if (!accessToken) return
    if (layoutId === '') {
      setError('Enter a layout template id (save a layout on the left, or type an existing id).')
      return
    }
    setBusLoading(true)
    setError(null)
    setMsg(null)
    try {
      const res = await adminApi.createBus(accessToken, {
        operatorCode,
        registrationNumber,
        busType,
        layoutTemplateId: layoutId as number,
      })
      setMsg(`Bus registered · ${res.registrationNumber} (vehicle id ${res.id}).`)
      void loadBuses()
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Failed to create bus')
    } finally {
      setBusLoading(false)
    }
  }

  const copyLayoutId = async () => {
    if (layoutId === '') return
    try {
      await navigator.clipboard.writeText(String(layoutId))
      setMsg(`Template id ${layoutId} copied.`)
    } catch {
      setError('Could not copy to clipboard.')
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
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Layouts & buses
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 800, lineHeight: 1.65 }}>
          First, define how seats are arranged on paper — labels and positions for every bookable spot. Then register a real
          vehicle and point it at that layout so trips and seat maps stay in sync. Pick the same coach style in both steps
          so passengers see the right grid when they book.
        </Typography>
      </Paper>

      {msg && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          {msg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: '1fr minmax(300px, 380px)' },
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
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                <ViewModuleIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Step 1 · Seat layout
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a coach style and row count, preview the grid, then save. Edit JSON only if you need something custom.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Tabs
              value={layoutTab}
              onChange={handleLayoutTab}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="Visual builder" id="layout-tab-0" aria-controls="layout-panel-0" />
              <Tab label="Advanced (JSON)" id="layout-tab-1" aria-controls="layout-panel-1" />
            </Tabs>

            {layoutTab === 0 && (
              <Stack spacing={2.5} role="tabpanel" id="layout-panel-0">
                <TextField
                  label="Template name"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g. Nightliner 2+2 + sleeper"
                />
                <TextField
                  select
                  label="Coach style"
                  value={busType}
                  onChange={(e) => setBusType(e.target.value as BusType)}
                  fullWidth
                  size="small"
                  helperText={BUS_TYPE_HELP[busType]}
                >
                  {(Object.keys(BUS_TYPE_LABEL) as BusType[]).map((key) => (
                    <MenuItem key={key} value={key}>
                      {BUS_TYPE_LABEL[key]}
                    </MenuItem>
                  ))}
                </TextField>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Rows / length: {rowCount}
                  </Typography>
                  <Slider
                    value={rowCount}
                    onChange={(_, v) => setRowCount(v as number)}
                    min={1}
                    max={40}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 20, label: '20' },
                      { value: 40, label: '40' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  The preview updates as you change style and length. Open Advanced to copy or hand-edit; switching there loads
                  the latest generated layout.
                </Typography>
              </Stack>
            )}

            {layoutTab === 1 && (
              <Stack spacing={1.5} role="tabpanel" id="layout-panel-1">
                <Typography variant="body2" color="text.secondary">
                  For experts — same structure as the visual builder: a list of seats with label, row, and column.
                </Typography>
                <TextField
                  label="Layout data"
                  value={layoutJson}
                  onChange={(e) => setLayoutJson(e.target.value)}
                  fullWidth
                  multiline
                  minRows={12}
                  spellCheck={false}
                  sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
                />
              </Stack>
            )}

            <Divider sx={{ my: 3 }} />

            {previewError ? (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                {previewError}
              </Alert>
            ) : (
              <LayoutSeatPreview seats={previewSeats} title="Preview" />
            )}

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 3, flexWrap: 'wrap' }}>
              <Button variant="contained" size="large" onClick={() => void createLayout()} disabled={layoutLoading}>
                {layoutLoading ? 'Saving…' : 'Save layout'}
              </Button>
              {layoutId !== '' && (
                <>
                  <Chip label={`Template id ${layoutId}`} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                  <Tooltip title="Copy template id">
                    <IconButton size="small" onClick={() => void copyLayoutId()} aria-label="Copy layout template id">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            position: { lg: 'sticky' },
            top: { lg: 88 },
            borderColor: alpha(theme.palette.secondary.main, 0.35),
            bgcolor: alpha(theme.palette.secondary.main, 0.03),
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: alpha(theme.palette.secondary.main, 0.08),
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.secondary.main, 0.22),
                }}
              >
                <DirectionsBusFilledIcon sx={{ color: 'secondary.dark' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Step 2 · Register bus
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tie a number plate to the layout you saved so schedules and seat maps use the right template.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2}>
              <TextField
                label="Operator code"
                value={operatorCode}
                onChange={(e) => setOperatorCode(e.target.value)}
                fullWidth
                size="small"
                helperText="Short code for your brand or fleet"
              />
              <TextField
                label="Registration number"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                fullWidth
                size="small"
                helperText="As shown on the vehicle"
              />
              <TextField
                select
                label="Coach style"
                value={busType}
                onChange={(e) => setBusType(e.target.value as BusType)}
                fullWidth
                size="small"
                helperText="Must match the layout you built on the left."
              >
                {(Object.keys(BUS_TYPE_LABEL) as BusType[]).map((key) => (
                  <MenuItem key={key} value={key}>
                    {BUS_TYPE_LABEL[key]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Layout template id"
                type="number"
                value={layoutId}
                onChange={(e) => setLayoutId(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment:
                    layoutId !== '' ? (
                      <InputAdornment position="end">
                        <Tooltip title="Copy id">
                          <IconButton size="small" onClick={() => void copyLayoutId()} edge="end" aria-label="Copy template id">
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ) : undefined,
                }}
                helperText="Filled when you save a layout, or enter an id from an existing template."
              />
              <Button variant="contained" color="secondary" size="large" onClick={() => void createBus()} disabled={busLoading}>
                {busLoading ? 'Saving…' : 'Register bus'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', borderColor: alpha(theme.palette.primary.main, 0.15) }}>
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: alpha(theme.palette.primary.main, 0.03),
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <DirectionsBusFilledIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Registered buses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vehicles already linked to a layout template. Refresh after registering a new bus.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => void loadBuses()}
              disabled={busesLoading}
            >
              Refresh
            </Button>
          </Stack>
        </Box>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {busesLoading && (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={32} />
            </Stack>
          )}
          {!busesLoading && busesError && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {busesError} If your API does not expose a bus list yet, this section will stay empty.
            </Alert>
          )}
          {!busesLoading && !busesError && buses.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No buses found yet. Register one using Step 2 above.
            </Typography>
          )}
          {!busesLoading && buses.length > 0 && (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2, maxHeight: 420 }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Id</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Registration</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Operator</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Coach style</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Layout template
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buses.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          #{b.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{b.registrationNumber}</TableCell>
                      <TableCell>{b.operatorCode ?? '—'}</TableCell>
                      <TableCell>{coachLabel(b.busType)}</TableCell>
                      <TableCell align="right">{b.layoutTemplateId ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
