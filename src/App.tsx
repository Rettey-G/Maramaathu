import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RoleSelectionPage from './pages/RoleSelectionPage'
import CustomerLayout from './pages/customer/CustomerLayout'
import WorkerLayout from './pages/worker/WorkerLayout'
import AdminLayout from './pages/admin/AdminLayout'
import LoadingSpinner from './components/LoadingSpinner'

function AuthenticatedRoutes() {
  const { user, role, loading, needsRoleSelection } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    // Allow access to landing page and login for unauthenticated users
    if (location.pathname === '/' || location.pathname === '/login') {
      return (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      )
    }
    return <Navigate to="/" replace />
  }

  // If user needs to select role (Google OAuth without role)
  if (needsRoleSelection) {
    return <RoleSelectionPage />
  }

  if (!role) {
    return <LoadingSpinner />
  }

  const defaultPath = role === 'admin' ? '/admin' : role === 'worker' ? '/worker' : '/customer'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultPath} replace />} />
      <Route path="" element={<Navigate to={defaultPath} replace />} />

      <Route
        path="/customer/*"
        element={role === 'customer' || role === 'worker' || role === 'admin' ? <CustomerLayout /> : <Navigate to={defaultPath} replace />}
      />
      <Route
        path="/worker/*"
        element={role === 'worker' || role === 'admin' ? <WorkerLayout /> : <Navigate to={defaultPath} replace />}
      />
      <Route
        path="/admin/*"
        element={role === 'admin' ? <AdminLayout /> : <Navigate to={defaultPath} replace />}
      />

      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<AuthenticatedRoutes />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}
