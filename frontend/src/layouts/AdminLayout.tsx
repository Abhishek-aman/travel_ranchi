import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AltRouteIcon from '@mui/icons-material/AltRoute'
import InventoryIcon from '@mui/icons-material/Inventory2'
import GroupsIcon from '@mui/icons-material/Groups'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import AssessmentIcon from '@mui/icons-material/Assessment'
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import { useAuth } from '../auth/useAuth'

const drawerWidth = 260

const items = [
  { to: '/admin', label: 'Overview', icon: <DashboardIcon /> },
  { to: '/admin/routes', label: 'Routes & schedules', icon: <AltRouteIcon /> },
  { to: '/admin/buses', label: 'Buses & layouts', icon: <DirectionsBusFilledIcon /> },
  { to: '/admin/inventory', label: 'Inventory', icon: <InventoryIcon /> },
  { to: '/admin/agents', label: 'Agents', icon: <GroupsIcon /> },
  { to: '/admin/bulk', label: 'Bulk requests', icon: <RequestQuoteIcon /> },
  { to: '/admin/reports', label: 'Reports', icon: <AssessmentIcon /> },
]

export function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout, email } = useAuth()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
      >
        <Toolbar sx={{ px: 2, flexDirection: 'column', alignItems: 'stretch', gap: 1, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" src="/favicon.svg" alt="" sx={{ width: 28, height: 28, mr: 1 }} />
            <Typography variant="h6" noWrap sx={{ fontWeight: 800, flex: 1 }}>
              Travel Ranchi Admin
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap>
            {email}
          </Typography>
          <Button size="small" variant="outlined" onClick={() => { logout(); navigate('/login', { replace: true }) }}>
            Sign out
          </Button>
        </Toolbar>
        <List sx={{ px: 1 }}>
          {items.map((item) => (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={
                item.to === '/admin' ? pathname === '/admin' : pathname === item.to || pathname.startsWith(`${item.to}/`)
              }
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}
