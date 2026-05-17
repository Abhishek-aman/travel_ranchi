import { useCallback } from 'react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import * as customerApi from '../../api/customerApi'
import { useBooking } from '../../context/useBooking'
import { useAuth } from '../../auth/useAuth'

export function ConfirmationPage() {
  const { customerAccessToken, hasRole } = useAuth()
  const { booking, reset } = useBooking()

  const downloadPdf = useCallback(async () => {
    if (!customerAccessToken || !booking.bookingReference) return
    const blob = await customerApi.downloadCustomerTicketPdf(customerAccessToken, booking.bookingReference)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-${booking.bookingReference}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }, [customerAccessToken, booking.bookingReference])

  if (!customerAccessToken || !hasRole('CUSTOMER')) {
    return <Navigate to="/" replace />
  }

  if (!booking.tripId || !booking.bookingReference) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography>No booking to show.</Typography>
        <Button component={RouterLink} to="/" sx={{ mt: 2 }}>
          Home
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 16px 48px rgba(15,118,110,0.12)' }}>
        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CheckCircleIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Booking confirmed
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {booking.bookingReference}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Ticket
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Guest booking — download your PDF below. No account was created.
          </Typography>
          <Box sx={{ my: 2, height: 1, bgcolor: 'divider' }} />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Journey
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>
            {booking.origin} → {booking.destination}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Trip #{booking.tripId}
            {booking.departureAt && ` · ${new Date(booking.departureAt).toLocaleString()}`}
          </Typography>
          <Typography sx={{ mt: 2, fontWeight: 600 }}>
            Seats: {booking.selectedSeats.map((s) => s.label).join(', ')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<PictureAsPdfIcon />} fullWidth onClick={() => void downloadPdf()}>
              Download PDF
            </Button>
            <Button variant="outlined" component={RouterLink} to="/" fullWidth onClick={() => reset()}>
              New search
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
