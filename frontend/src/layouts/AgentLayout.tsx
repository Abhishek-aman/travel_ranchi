import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SearchIcon from '@mui/icons-material/Search'
import HomeIcon from '@mui/icons-material/Home'
import LogoutIcon from '@mui/icons-material/Logout'
import { useMemo } from 'react'
import { useAuth } from '../auth/useAuth'

export function AgentLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { logout } = useAuth()

  const tab = useMemo(() => {
    if (pathname.includes('/verify')) return 2
    if (pathname.includes('/search') || pathname.includes('/trip')) return 1
    return 0
  }, [pathname])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
            Agent
          </Typography>
          <IconButton
            edge="end"
            aria-label="logout"
            onClick={() => {
              logout()
              navigate('/agent/login', { replace: true })
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Outlet />
      </Container>

      <PaperNav tab={tab} navigate={navigate} />
    </Box>
  )
}

function PaperNav({ tab, navigate }: { tab: number; navigate: (path: string) => void }) {
  return (
    <BottomNavigation
      value={tab}
      showLabels
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 1100,
        height: 64,
      }}
      onChange={(_, v) => {
        if (v === 0) navigate('/agent')
        if (v === 1) navigate('/agent/search')
        if (v === 2) navigate('/agent/verify')
      }}
    >
      <BottomNavigationAction label="Home" icon={<HomeIcon />} />
      <BottomNavigationAction label="Book" icon={<SearchIcon />} />
      <BottomNavigationAction label="Verify" icon={<QrCodeScannerIcon />} />
    </BottomNavigation>
  )
}
