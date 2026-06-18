import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from '../pages/Landing/Landing.jsx'
import Dashboard from '../pages/Dashboard/Dashboard.jsx'
import AdminPage from '../pages/Admin/AdminPage.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
