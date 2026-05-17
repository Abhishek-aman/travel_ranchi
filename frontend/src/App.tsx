import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CustomerLayout } from './layouts/CustomerLayout'
import { AgentLayout } from './layouts/AgentLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { HomePage } from './pages/customer/HomePage'
import { SearchPage } from './pages/customer/SearchPage'
import { TripSelectPage } from './pages/customer/TripSelectPage'
import { CheckoutPage } from './pages/customer/CheckoutPage'
import { ConfirmationPage } from './pages/customer/ConfirmationPage'
import { BulkBookingPage } from './pages/customer/BulkBookingPage'
import { CharterBusHirePage } from './pages/customer/CharterBusHirePage'
import { BusGpsTrackingPage } from './pages/customer/BusGpsTrackingPage'
import { LoginPage } from './pages/LoginPage'
import { AgentLoginPage } from './pages/agent/AgentLoginPage'
import { AgentDashboardPage } from './pages/agent/AgentDashboardPage'
import { AgentSearchPage } from './pages/agent/AgentSearchPage'
import { AgentTripBookPage } from './pages/agent/AgentTripBookPage'
import { AgentVerifyPage } from './pages/agent/AgentVerifyPage'
import { AgentBoardingPage } from './pages/agent/AgentBoardingPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminRoutesPage } from './pages/admin/AdminRoutesPage'
import { AdminBusesPage } from './pages/admin/AdminBusesPage'
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage'
import { AdminAgentsPage } from './pages/admin/AdminAgentsPage'
import { AdminBulkPage } from './pages/admin/AdminBulkPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { useAuth } from './auth/useAuth'

function AgentGate() {
  const location = useLocation()
  const { isAuthenticated, hasRole } = useAuth()
  if (!isAuthenticated || !hasRole('AGENT')) {
    return <Navigate to="/agent/login" replace state={{ from: location.pathname }} />
  }
  return <AgentLayout />
}

function AdminGate() {
  const location = useLocation()
  const { isAuthenticated, hasRole } = useAuth()
  if (!isAuthenticated || !hasRole('ADMIN')) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <AdminLayout />
}

export default function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/trip/:tripId" element={<TripSelectPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/bulk" element={<BulkBookingPage />} />
        <Route path="/private-bus-hire-india" element={<CharterBusHirePage />} />
        <Route path="/live-bus-gps-tracking" element={<BusGpsTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/agent/login" element={<AgentLoginPage />} />
      <Route path="/agent" element={<AgentGate />}>
        <Route index element={<AgentDashboardPage />} />
        <Route path="search" element={<AgentSearchPage />} />
        <Route path="trip/:tripId" element={<AgentTripBookPage />} />
        <Route path="verify" element={<AgentVerifyPage />} />
        <Route path="boarding/:tripId" element={<AgentBoardingPage />} />
      </Route>

      <Route path="/admin" element={<AdminGate />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="routes" element={<AdminRoutesPage />} />
        <Route path="buses" element={<AdminBusesPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="agents" element={<AdminAgentsPage />} />
        <Route path="bulk" element={<AdminBulkPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
