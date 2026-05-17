import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'
import { alpha } from '@mui/material/styles'
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled'

export function CustomerLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={(theme) => ({
          bgcolor: isHome ? alpha(theme.palette.background.paper, 0.92) : 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)',
        })}
      >
        <Toolbar sx={{ py: 1, flexWrap: 'wrap', rowGap: 1 }}>
          <DirectionsBusFilledIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: 32 }} />
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 800 }}>
            FleetLine
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button component={RouterLink} to="/private-bus-hire-india" color="inherit" size="small">
              Charter & hire
            </Button>
            <Button component={RouterLink} to="/live-bus-gps-tracking" color="inherit" size="small">
              GPS tracking
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ py: 4, mt: 'auto', bgcolor: 'surface.main', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} FleetLine
              {import.meta.env.DEV && (
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 1, opacity: 0.75 }}>
                  · Dev API {import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}
                </Box>
              )}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Link component={RouterLink} to="/admin" underline="hover" color="inherit" variant="body2">
                Operator console
              </Link>
              <Link component={RouterLink} to="/agent/login" underline="hover" color="inherit" variant="body2">
                Agent login
              </Link>
              <Link href="#" underline="hover" color="inherit" variant="body2">
                Privacy
              </Link>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
