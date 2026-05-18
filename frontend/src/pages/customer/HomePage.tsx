import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import { alpha, useTheme } from '@mui/material/styles'
import ShieldIcon from '@mui/icons-material/Shield'
import BoltIcon from '@mui/icons-material/Bolt'
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const HERO_BUS_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80',
    alt: 'Intercity coach on the highway',
  },
  {
    src: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80',
    alt: 'Modern bus interior and seats',
  },
  {
    src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80',
    alt: 'Bus at terminal during boarding',
  },
] as const

const POPULAR_ROUTES: { label: string; origin: string; destination: string }[] = [
  { label: 'Mumbai → Pune', origin: 'Mumbai', destination: 'Pune' },
  { label: 'Delhi → Jaipur', origin: 'Delhi', destination: 'Jaipur' },
  { label: 'Bangalore → Chennai', origin: 'Bangalore', destination: 'Chennai' },
  { label: 'Hyderabad → Vijayawada', origin: 'Hyderabad', destination: 'Vijayawada' },
  { label: 'Ahmedabad → Surat', origin: 'Ahmedabad', destination: 'Surat' },
]

const FEATURES = [
  {
    icon: BoltIcon,
    title: 'Live seat map',
    body: 'See which seats are free or taken before you pay — no guessing on a full bus.',
  },
  {
    icon: ShieldIcon,
    title: 'Secure checkout',
    body: 'Book online with a clear fare and a safe payment step. You get a confirmation you can trust.',
  },
  {
    icon: DirectionsBusFilledIcon,
    title: 'Fleet-ready',
    body: 'Optional GPS tracking and charter enquiries — built for operators who run serious schedules.',
  },
] as const

export function HomePage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [heroIndex, setHeroIndex] = useState(0)
  const [origin, setOrigin] = useState('Mumbai')
  const [destination, setDestination] = useState('Pune')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const onSearch = () => {
    const q = new URLSearchParams({ origin, destination, date })
    navigate(`/search?${q.toString()}`)
  }

  const applyShortcut = (o: string, d: string) => {
    setOrigin(o)
    setDestination(d)
    const q = new URLSearchParams({ origin: o, destination: d, date })
    navigate(`/search?${q.toString()}`)
  }

  const nextHero = () => setHeroIndex((i) => (i + 1) % HERO_BUS_IMAGES.length)
  const prevHero = () => setHeroIndex((i) => (i - 1 + HERO_BUS_IMAGES.length) % HERO_BUS_IMAGES.length)

  useEffect(() => {
    const timer = window.setInterval(nextHero, 5000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 48%, ${alpha(t.palette.secondary.main, 0.28)} 100%)`,
          color: 'primary.contrastText',
          pt: { xs: 5, md: 8 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.14,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Hero photography */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: { xs: 'none', md: 'block' },
            pointerEvents: 'none',
          }}
        >
          <Box
            component="img"
            src={HERO_BUS_IMAGES[heroIndex].src}
            alt={HERO_BUS_IMAGES[heroIndex].alt}
            sx={{
              position: 'absolute',
              right: '-8%',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 'min(52vw, 720px)',
              maxHeight: '88%',
              objectFit: 'cover',
              borderRadius: 4,
              boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
              opacity: 0.95,
              border: `4px solid ${alpha('#fff', 0.2)}`,
            }}
          />
        </Box>
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'relative',
            mb: 2,
            mx: { xs: -2, sm: 0 },
            borderRadius: { xs: 0, sm: 3 },
            overflow: 'hidden',
            maxHeight: 220,
          }}
        >
          <Box
            component="img"
            src={HERO_BUS_IMAGES[heroIndex].src}
            alt={HERO_BUS_IMAGES[heroIndex].alt}
            sx={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
          />
          <Stack direction="row" justifyContent="space-between" sx={{ position: 'absolute', top: '50%', left: 8, right: 8, transform: 'translateY(-50%)' }}>
            <IconButton onClick={prevHero} aria-label="Previous bus photo" sx={{ bgcolor: alpha('#000', 0.35), color: '#fff', '&:hover': { bgcolor: alpha('#000', 0.5) } }}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={nextHero} aria-label="Next bus photo" sx={{ bgcolor: alpha('#000', 0.35), color: '#fff', '&:hover': { bgcolor: alpha('#000', 0.5) } }}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, mb: 1 }}>
            <IconButton size="small" onClick={prevHero} aria-label="Previous bus photo" sx={{ color: 'inherit', bgcolor: alpha('#fff', 0.12) }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={nextHero} aria-label="Next bus photo" sx={{ color: 'inherit', bgcolor: alpha('#fff', 0.12) }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack spacing={2} sx={{ maxWidth: { xs: '100%', md: '52%' } }}>
            <Chip
              label="Real-time availability"
              sx={{ alignSelf: 'flex-start', bgcolor: alpha('#fff', 0.15), color: 'inherit', fontWeight: 600 }}
            />
            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
              Book intercity buses with seat-level certainty
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.92, fontWeight: 400, maxWidth: 560 }}>
              Search city-to-city routes, choose your seats, pay online, and travel with a ticket you can show on your phone.
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 1 }}>
              <Typography variant="caption" sx={{ width: '100%', opacity: 0.85, fontWeight: 600, letterSpacing: 0.5 }}>
                POPULAR ROUTES
              </Typography>
              {POPULAR_ROUTES.map((r) => (
                <Chip
                  key={r.label}
                  label={r.label}
                  onClick={() => applyShortcut(r.origin, r.destination)}
                  clickable
                  sx={{
                    bgcolor: alpha('#fff', 0.12),
                    color: 'inherit',
                    fontWeight: 600,
                    border: `1px solid ${alpha('#fff', 0.25)}`,
                    '&:hover': { bgcolor: alpha('#fff', 0.22) },
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <Paper
            elevation={8}
            sx={{
              mt: 4,
              p: { xs: 2, sm: 3 },
              maxWidth: 920,
              borderRadius: 3,
              boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-end' } }}>
              <TextField
                fullWidth
                label="Origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="City name"
                sx={{ bgcolor: 'background.paper' }}
              />
              <TextField
                fullWidth
                label="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="City name"
                sx={{ bgcolor: 'background.paper' }}
              />
              <TextField
                fullWidth
                type="date"
                label="Travel date"
                InputLabelProps={{ shrink: true }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={{ bgcolor: 'background.paper' }}
              />
              <Button variant="contained" color="secondary" size="large" onClick={onSearch} sx={{ py: 1.75, minWidth: { md: 160 } }}>
                Search buses
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 7, md: 10 },
          background: (t) =>
            `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.04)} 0%, ${t.palette.background.default} 45%, ${alpha(t.palette.secondary.main, 0.05)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1} sx={{ mb: 1, textAlign: { xs: 'left', md: 'center' }, maxWidth: 720, mx: { md: 'auto' } }}>
            <Typography variant="overline" sx={{ letterSpacing: 2, color: 'primary.main', fontWeight: 700 }}>
              Built for travellers & fleets
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Why Travel Ranchi
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.65, mt: 1 }}>
              One place for travellers to book online, for agents to serve passengers at stops, and for your team to keep routes
              and buses under control — without juggling spreadsheets.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 3,
              mt: 5,
            }}
          >
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Paper
                key={title}
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 48px ${alpha(theme.palette.primary.main, 0.12)}`,
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
                      color: 'primary.main',
                    }}
                  >
                    <Icon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.3 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {body}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
