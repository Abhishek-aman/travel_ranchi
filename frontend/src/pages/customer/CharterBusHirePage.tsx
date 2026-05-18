import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal'
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle'
import HotelIcon from '@mui/icons-material/Hotel'
import GroupsIcon from '@mui/icons-material/Groups'
import { Seo } from '../../components/Seo'

const VEHICLE_TYPES = [
  {
    title: '2×2 AC seater',
    icon: AirportShuttleIcon,
    body: 'Ideal for corporate shuttles, college trips, and pilgrimages — high capacity with aisle access for every row.',
  },
  {
    title: '2×3 seater / semi-sleeper',
    icon: GroupsIcon,
    body: 'Cost-effective for long-distance budget routes where travellers prefer upright seating with extra legroom options.',
  },
  {
    title: 'Volvo / Scania multi-axle sleeper',
    icon: HotelIcon,
    body: 'Premium overnight comfort with berths, privacy curtains, and charging — the default choice for 400km+ legs.',
  },
  {
    title: 'Hybrid seater + sleeper',
    icon: AirlineSeatReclineNormalIcon,
    body: 'Mixed layouts for families and solo travellers on the same departure — maximise yield on busy corridors.',
  },
] as const

const videoId = import.meta.env.VITE_CHARTER_PROMO_VIDEO_ID as string | undefined

export function CharterBusHirePage() {
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [route, setRoute] = useState('')
  const [dates, setDates] = useState('')
  const [pax, setPax] = useState('')
  const [notes, setNotes] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <Seo
        title="Private bus hire India | Complete charter booking enquiry | AC sleeper & seater"
        description="Request a quote for private bus hire in India: corporate charters, weddings, school trips, and outstation tours. Volvo sleeper, seater, and hybrid coaches. Fast Travel Ranchi operator response."
        keywords="private bus hire India, charter bus booking, AC sleeper bus rental, corporate bus hire, wedding bus booking, outstation bus package, complete bus booking enquiry, Volvo bus hire India"
        canonicalPath="/private-bus-hire-india"
      />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
          Charter & group mobility
        </Typography>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontSize: { xs: '1.85rem', md: '2.5rem' }, mt: 1, mb: 2 }}>
          Private bus hire & complete charter booking across India
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, mb: 3 }}>
          Whether you need a <strong>Volvo AC sleeper bus for outstation tours</strong>, a <strong>2×2 seater coach for corporate transfers</strong>, or a{' '}
          <strong>mixed-layout vehicle for weddings and college trips</strong>, Travel Ranchi operators can price your itinerary end-to-end. Submit the enquiry
          form below — include dates, passenger count, and any multi-day route so we can match you with the right{' '}
          <strong>bus type and compliance-ready crew</strong>. This page is structured for travellers and planners searching for{' '}
          <em>private bus hire India</em>, <em>charter bus booking</em>, and <em>complete bus booking</em> workflows on Google.
        </Typography>

        {videoId && (
          <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden', boxShadow: 2, aspectRatio: '16/9' }}>
            <Box
              component="iframe"
              title="Travel Ranchi charter and fleet overview"
              width="100%"
              height="100%"
              sx={{ border: 0, display: 'block', minHeight: { xs: 220, sm: 360 } }}
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        )}

        <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 2 }}>
          Vehicle types we route enquiries to
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2,
            mb: 4,
          }}
        >
          {VEHICLE_TYPES.map(({ title, body, icon: Icon }) => (
            <Card key={title} variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Icon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {body}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 1 }}>
          Complete bus booking enquiry
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This form is a front-end capture for your sales desk. Wire it to email, CRM, or <code>POST /api/enquiries/charter</code> when your backend is ready.
        </Typography>

        {sent ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Thanks — your enquiry was recorded locally for demo. Connect the submit handler to your API or inbox.
          </Alert>
        ) : null}

        <Paper component="form" variant="outlined" onSubmit={submit} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          <Stack spacing={2}>
            <TextField required label="Organiser name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField required type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField required label="Phone / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            <TextField required label="Route (e.g. Mumbai – Lonavala – Pune return)" value={route} onChange={(e) => setRoute(e.target.value)} fullWidth />
            <TextField required label="Travel dates & timing" value={dates} onChange={(e) => setDates(e.target.value)} fullWidth multiline minRows={2} />
            <TextField required label="Approx. passengers" value={pax} onChange={(e) => setPax(e.target.value)} fullWidth />
            <TextField label="Amenities & notes (Wi‑Fi, luggage, halts)" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline minRows={3} />
            <Button type="submit" variant="contained" size="large" disabled={sent}>
              Submit enquiry
            </Button>
          </Stack>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4, lineHeight: 1.7 }}>
          <strong>SEO note:</strong> For strongest Google visibility, serve this URL as server-rendered HTML or prerendered static content with the same
          headings and copy, and add JSON-LD <code>FAQPage</code> or <code>Service</code> schema on the host. Client-side meta helps social previews;
          crawlers still benefit from matching visible text and fast LCP images.
        </Typography>
      </Container>
    </>
  )
}
