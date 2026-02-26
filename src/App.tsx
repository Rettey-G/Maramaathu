import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import RoleSelectionPage from './pages/RoleSelectionPage'
import CustomerLayout from './pages/customer/CustomerLayout'
import WorkerLayout from './pages/worker/WorkerLayout'
import AdminLayout from './pages/admin/AdminLayout'
import LoadingSpinner from './components/LoadingSpinner'

function AuthenticatedRoutes() {
  const { user, role, loading, needsRoleSelection } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If user needs to select role (Google OAuth without role)
  if (needsRoleSelection) {
    return <RoleSelectionPage />
  }

  if (!role) {
    return <Navigate to="/login" replace />
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<AuthenticatedRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
