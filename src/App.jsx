import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import ProtectedRoute from './routes/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Login from './pages/Login'
import HomePage from "./pages/HomePage";
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import Credits from './pages/Credits'
import Settings from './pages/Settings'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import useAdminStore from './store/adminStore'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      {/* Sidebar receives open state + close handler */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* TopBar receives handler to open sidebar */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <div className="page-inner">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>

      {/* Mobile layout overrides */}
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
          .main-content > header,
          .main-content > div > header {
            left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

function AdminRoute() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated)
  return isAuthenticated
    ? <AdminDashboard />
    : <Navigate to="/admin" replace />
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <Routes>
      {/* PUBLIC routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminRoute />} />

      {/* PROTECTED routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<AppLayout />} />
      </Route>
    </Routes>
  )
}
