import { useEffect, useState, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import AltRouteIcon from '@mui/icons-material/AltRoute'
import AssessmentIcon from '@mui/icons-material/Assessment'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled'
import GroupsIcon from '@mui/icons-material/Groups'
import InventoryIcon from '@mui/icons-material/Inventory2'
import RefreshIcon from '@mui/icons-material/Refresh'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import { alpha, useTheme } from '@mui/material/styles'
import * as adminApi from '../../api/adminApi'
import type { AdminBulkDto, ReportsSummary } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../api/http'

async function fetchDashboardData(accessToken: string): Promise<{
  summary: ReportsSummary | null
  bulkList: AdminBulkDto[] | null
  error: string | null
  bulkError: boolean
}> {
  const [summaryResult, bulkResult] = await Promise.allSettled([
    adminApi.getReportsSummary(accessToken),
    adminApi.listBulkRequests(accessToken),
  ])

  let error: string | null = null
  let summary: ReportsSummary | null = null
  if (summaryResult.status === 'fulfilled') {
    summary = summaryResult.value
  } else {
    const reason = summaryResult.reason
    error = reason instanceof ApiError ? reason.message : 'Could not load booking totals.'
  }

  let bulkList: AdminBulkDto[] | null = null
  let bulkError = false
  if (bulkResult.status === 'fulfilled') {
    bulkList = bulkResult.value
  } else {
    bulkList = []
    bulkError = true
  }

  return { summary, bulkList, error, bulkError }
}

const QUICK_LINKS: {
  to: string
  title: string
  description: string
  icon: ReactNode
}[] = [
  {
    to: '/admin/routes',
    title: 'Routes & schedules',
    description: 'Search corridors, add routes, and plan trips',
    icon: <AltRouteIcon />,
  },
  {
    to: '/admin/buses',
    title: 'Buses & layouts',
    description: 'Seat templates and fleet registration',
    icon: <DirectionsBusFilledIcon />,
  },
  {
    to: '/admin/inventory',
    title: 'Inventory',
    description: 'Block or unblock seats on services',
    icon: <InventoryIcon />,
  },
  {
    to: '/admin/agents',
    title: 'Agents',
    description: 'Agent accounts and access',
    icon: <GroupsIcon />,
  },
  {
    to: '/admin/bulk',
    title: 'Group travel',
    description: 'Review large booking requests',
    icon: <RequestQuoteIcon />,
  },
]

function StatCard({
  title,
  value,
  hint,
  icon,
  accent = 'primary',
}: {
  title: string
  value: string | number
  hint?: string
  icon: ReactNode
  accent?: 'primary' | 'secondary' | 'success' | 'warning'
}) {
  const theme = useTheme()
  const color = theme.palette[accent].main
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'visible',
        borderColor: alpha(color, 0.25),
        background: `linear-gradient(145deg, ${alpha(color, 0.06)} 0%, ${theme.palette.background.paper} 55%)`,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.2, color: 'text.primary' }}>
              {value}
            </Typography>
            {hint && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.5 }}>
                {hint}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              flexShrink: 0,
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              bgcolor: alpha(color, 0.12),
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export function AdminDashboardPage() {
  const theme = useTheme()
  const { accessToken } = useAuth()
  const [summary, setSummary] = useState<ReportsSummary | null>(null)
  const [bulkList, setBulkList] = useState<AdminBulkDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bulkError, setBulkError] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect -- fetch dashboard on mount / token change */
  useEffect(() => {
    if (!accessToken) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchDashboardData(accessToken)
        if (cancelled) return
        setSummary(data.summary)
        setBulkList(data.bulkList)
        setError(data.error)
        setBulkError(data.bulkError)
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof ApiError ? e.message : 'Something went wrong.')
        setSummary(null)
        setBulkList([])
        setBulkError(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [accessToken])
  /* eslint-enable react-hooks/set-state-in-effect */

  const load = () => {
    if (!accessToken) return
    setLoading(true)
    void (async () => {
      try {
        const data = await fetchDashboardData(accessToken)
        setSummary(data.summary)
        setBulkList(data.bulkList)
        setError(data.error)
        setBulkError(data.bulkError)
      } catch (e: unknown) {
        setError(e instanceof ApiError ? e.message : 'Something went wrong.')
        setSummary(null)
        setBulkList([])
        setBulkError(false)
      } finally {
        setLoading(false)
      }
    })()
  }

  const pendingBulk = bulkList?.filter((b) => b.status === 'PENDING').length ?? 0
  const totalBulk = bulkList?.length ?? 0

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Operations overview
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 640, lineHeight: 1.65 }}>
              A snapshot of bookings across the platform and group-travel requests that need attention. Use the shortcuts
              below to manage routes, fleet, and inventory.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void load()}
            disabled={loading}
            sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      {loading && (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading dashboard…
          </Typography>
        </Stack>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && summary && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          <StatCard
            title="Total bookings"
            value={summary.totalBookings}
            hint="Confirmed and recorded trips across all channels."
            icon={<ConfirmationNumberIcon />}
            accent="primary"
          />
          <StatCard
            title="Group requests waiting"
            value={pendingBulk}
            hint={
              pendingBulk > 0
                ? 'Review and approve under Group travel.'
                : 'No open group booking requests right now.'
            }
            icon={<RequestQuoteIcon />}
            accent="warning"
          />
          <StatCard
            title="Group requests (all)"
            value={totalBulk}
            hint={
              bulkError
                ? 'Bulk list could not be loaded (check permissions).'
                : 'Includes pending, approved, rejected, and paid.'
            }
            icon={<AssessmentIcon />}
            accent="success"
          />
        </Box>
      )}

      {!loading && bulkError && !error && summary && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Group travel totals may be incomplete — the bulk requests list could not be loaded.
        </Alert>
      )}

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Quick access
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {QUICK_LINKS.map((item) => (
            <Card key={item.to} variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
              <CardActionArea component={RouterLink} to={item.to} sx={{ height: '100%', alignItems: 'stretch', p: 0 }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {item.title}
                        </Typography>
                        <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>

      {!loading && !error && pendingBulk > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(theme.palette.warning.main, 0.35),
            bgcolor: alpha(theme.palette.warning.main, 0.06),
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip label={`${pendingBulk} open`} color="warning" size="small" />
              <Typography variant="body2" color="text.secondary">
                Group travel requests need a decision (approve payment link or reject).
              </Typography>
            </Stack>
            <Button variant="contained" color="warning" component={RouterLink} to="/admin/bulk" endIcon={<ChevronRightIcon />}>
              Review requests
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
