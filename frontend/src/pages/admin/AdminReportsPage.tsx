import { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import * as adminApi from '../../api/adminApi'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../api/http'
import type { BusAgentReportRow } from '../../api/types'

const DEMO_ROWS: BusAgentReportRow[] = [
  { busId: 101, busRegistration: 'MH-01-AB-1234', agentId: 7, agentLabel: 'agent@demo.local', bookingsCount: 42, grossRevenue: 186200 },
  { busId: 102, busRegistration: 'MH-01-CD-9012', agentId: 7, agentLabel: 'agent@demo.local', bookingsCount: 31, grossRevenue: 142800 },
  { busId: 101, busRegistration: 'MH-01-AB-1234', agentId: 9, agentLabel: 'borivali.counter', bookingsCount: 18, grossRevenue: 78400 },
]

export function AdminReportsPage() {
  const { accessToken } = useAuth()
  const [total, setTotal] = useState<number | null>(null)
  const [rows, setRows] = useState<BusAgentReportRow[]>([])
  const [usingDemoBreakdown, setUsingDemoBreakdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currency = useMemo(
    () =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }),
    [],
  )

  useEffect(() => {
    if (!accessToken) return
    let c = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [s, breakdown] = await Promise.all([
          adminApi.getReportsSummary(accessToken),
          adminApi.getReportsByBusAndAgent(accessToken).catch(() => [] as BusAgentReportRow[]),
        ])
        if (c) return
        setTotal(s.totalBookings)
        if (breakdown.length > 0) {
          setRows(breakdown)
          setUsingDemoBreakdown(false)
        } else {
          setRows(DEMO_ROWS)
          setUsingDemoBreakdown(true)
        }
      } catch (e: unknown) {
        if (!c) setError(e instanceof ApiError ? e.message : 'Failed')
      } finally {
        if (!c) setLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [accessToken])

  return (
    <Stack spacing={2}>
      <div>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Reports
        </Typography>
        <Typography color="text.secondary">Summary: GET /api/admin/reports/summary · Breakdown: GET /api/admin/reports/by-bus-agent</Typography>
      </div>

      {loading && (
        <Stack alignItems="center">
          <CircularProgress size={28} />
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {total !== null && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {total}
            </Typography>
            <Typography color="text.secondary">Total bookings</Typography>
          </CardContent>
        </Card>
      )}

      {usingDemoBreakdown && !loading && (
        <Alert severity="info">
          Showing sample per-bus / per-agent rows until <code>GET /api/admin/reports/by-bus-agent</code> returns data.
        </Alert>
      )}

      {!loading && rows.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small" aria-label="Bookings by bus and agent">
            <TableHead>
              <TableRow>
                <TableCell>Bus</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell align="right">Bookings</TableCell>
                <TableCell align="right">Gross revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow key={`${r.busId}-${r.agentId}-${idx}`}>
                  <TableCell>#{r.busId}</TableCell>
                  <TableCell>{r.busRegistration || '—'}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2">{r.agentLabel || `Agent #${r.agentId}`}</Typography>
                      <Chip label={`id ${r.agentId}`} size="small" variant="outlined" />
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{r.bookingsCount}</TableCell>
                  <TableCell align="right">{currency.format(r.grossRevenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  )
}
