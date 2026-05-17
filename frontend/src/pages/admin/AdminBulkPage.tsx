import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import * as adminApi from '../../api/adminApi'
import type { AdminBulkDto } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../api/http'

export function AdminBulkPage() {
  const { accessToken } = useAuth()
  const [rows, setRows] = useState<AdminBulkDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentLink, setPaymentLink] = useState('https://pay.example.com/link/demo')

  const load = async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const list = await adminApi.listBulkRequests(accessToken)
      setRows(list)
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [accessToken])

  const approve = async (id: number) => {
    if (!accessToken) return
    try {
      await adminApi.approveBulkRequest(accessToken, id, paymentLink)
      await load()
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Approve failed')
    }
  }

  const reject = async (id: number) => {
    if (!accessToken) return
    try {
      await adminApi.rejectBulkRequest(accessToken, id)
      await load()
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'Reject failed')
    }
  }

  return (
    <Stack spacing={2}>
      <div>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Bulk booking requests
        </Typography>
        <Typography color="text.secondary">GET /api/admin/bulk-requests · approve / reject</Typography>
      </div>

      <TextField
        label="Payment link (used on approve)"
        value={paymentLink}
        onChange={(e) => setPaymentLink(e.target.value)}
        fullWidth
        size="small"
      />

      {loading && (
        <Stack alignItems="center">
          <CircularProgress size={28} />
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      <Card variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Seats</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b.id} hover>
                <TableCell>{b.id}</TableCell>
                <TableCell>{b.email}</TableCell>
                <TableCell align="right">{b.seats}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={b.status}
                    color={
                      b.status === 'APPROVED' ? 'success' : b.status === 'REJECTED' ? 'error' : 'warning'
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  {b.status === 'PENDING' && (
                    <>
                      <Button size="small" onClick={() => void approve(b.id)}>
                        Approve
                      </Button>
                      <Button size="small" color="error" onClick={() => void reject(b.id)}>
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  )
}
