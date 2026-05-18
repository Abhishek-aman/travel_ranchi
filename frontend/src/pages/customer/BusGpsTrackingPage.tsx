import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { Seo } from '../../components/Seo'

export function BusGpsTrackingPage() {
  return (
    <>
      <Seo
        title="Live bus GPS tracking | Share trip link with passengers | Travel Ranchi"
        description="See how Travel Ranchi ties live GPS to scheduled trips so families and corporates can follow the coach on the map. Works with operator-approved tracking hardware and driver apps."
        keywords="live bus GPS tracking, bus location tracker India, share bus trip link, fleet GPS for buses, real-time coach tracking"
        canonicalPath="/live-bus-gps-tracking"
      />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Chip label="Fleet operations" color="primary" size="small" sx={{ fontWeight: 700, mb: 2 }} />
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontSize: { xs: '1.85rem', md: '2.4rem' }, mb: 2 }}>
          Live bus GPS tracking for passengers and control rooms
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, mb: 3 }}>
          Modern travellers expect a <strong>shareable tracking link</strong> the same way they expect e-tickets. Travel Ranchi is designed so your dispatch team
          can attach <strong>live GPS positions</strong> to each trip — reducing “where is my bus?” calls and improving safety audits. The map below is a
          placeholder embed; production builds typically integrate Google Maps Platform, Mapbox, or your telematics vendor feed via WebSocket.
        </Typography>

        <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
          <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/10', bgcolor: 'surface.main' }}>
            <Box
              component="iframe"
              title="Example map — replace with live trip tracking widget"
              width="100%"
              height="100%"
              sx={{ border: 0, display: 'block', minHeight: 280 }}
              src="https://maps.google.com/maps?q=Mumbai+Central+Bus+Stand&z=12&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Box>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Demo embed (Mumbai). Hook this region to your <code>GET /api/public/trips/:id/location</code> or telematics stream.
            </Typography>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
            What you ship with GPS enabled
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            • <strong>ETA recalculation</strong> when traffic diverges from the schedule. <br />
            • <strong>Geofenced stops</strong> to auto-mark arrivals for parents and schools. <br />
            • <strong>Incident playback</strong> for insurance — speed and route history per bus. <br />•{' '}
            <strong>Agent visibility</strong> so counters can answer confidently while the bus is en route.
          </Typography>
        </Stack>
      </Container>
    </>
  )
}
