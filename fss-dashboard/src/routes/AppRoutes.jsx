import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from '../pages/Landing/Landing.jsx'
import Dashboard from '../pages/Dashboard/Dashboard.jsx'

/**
 * Khai báo điều hướng của ứng dụng.
 *   /            -> Landing Page (giới thiệu hệ thống)
 *   /dashboard   -> Dashboard (giám sát & điều khiển)
 *   *            -> chuyển hướng về Landing
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
