import axios from 'axios'

export const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true'
export const POLL_INTERVAL = Number(import.meta.env.VITE_POLL_INTERVAL) || 5000

const http = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '') + '/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

// JWT Request Interceptor
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('ignis_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response Interceptor — handle 401
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('ignis_token')
      localStorage.removeItem('ignis_user')
      localStorage.removeItem('ignis_role')
      // Only redirect if not already on landing page
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    console.error('[API]', err?.config?.url, err?.response?.status, err?.message)
    return Promise.reject(err)
  }
)

// ── Auth ──
export const login = (username, password) =>
  http.post('/auth/login', { username, password }).then(r => r.data)

export const register = (username, password) =>
  http.post('/auth/register', { username, password }).then(r => r.data)

// ── Dashboard ──
export const getDashboard = () =>
  http.get('/dashboard/live-sensor').then(r => r.data)

export const getChartData = () =>
  http.get('/dashboard/chart-data').then(r => r.data)

// ── Fire Events ──
export const getFireEvents = () =>
  http.get('/fire-events').then(r => r.data)

export const deleteFireEvent = (id) =>
  http.delete(`/fire-events/${id}`).then(r => r.data)

export const deleteAllFireEvents = () =>
  http.delete('/fire-events').then(r => r.data)

// ── System Control ──
export const postControl = (action, value) =>
  http.post('/system/control', { action, value }).then(r => r.data)

// ── Users (Admin) ──
export const getUsers = () =>
  http.get('/users').then(r => r.data)

export const deleteUser = (id) =>
  http.delete(`/users/${id}`).then(r => r.data)

export const updateUserRole = (id, role) =>
  http.put(`/users/${id}/role`, { role }).then(r => r.data)

export default http
