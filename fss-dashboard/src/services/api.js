import axios from 'axios'

/* ============================================================
   api.js — Lớp giao tiếp với Backend qua Axios.

   Cấu hình qua biến môi trường (.env):
     VITE_API_BASE_URL   URL gốc của backend (vd: http://localhost:8080)
     VITE_USE_REAL_API   "true" để gọi API thật, "false" để chạy mô phỏng
     VITE_POLL_INTERVAL  chu kỳ polling (ms)

   Khi backend chưa sẵn sàng, đặt VITE_USE_REAL_API=false — Dashboard
   sẽ tự chạy ở chế độ mô phỏng (simulation) hoàn toàn offline.
   ============================================================ */

export const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true'
export const POLL_INTERVAL = Number(import.meta.env.VITE_POLL_INTERVAL) || 1000

const baseURL = (import.meta.env.VITE_API_BASE_URL || '') + '/api'

// Axios instance dùng chung cho toàn bộ ứng dụng
const http = axios.create({
  baseURL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

// Log lỗi tập trung (có thể thay bằng toast/notification sau này)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API ERROR]', err?.config?.url, err?.message)
    return Promise.reject(err)
  }
)

/* ---------------- GET endpoints ---------------- */

// GET /api/sensors  — trạng thái mảng cảm biến S0–S6
export const getSensors = () => http.get('/sensors').then((r) => r.data)

// GET /api/system-status — trạng thái tổng thể hệ thống
export const getSystemStatus = () => http.get('/system-status').then((r) => r.data)

// GET /api/servo — vị trí pan/tilt hiện tại
export const getServo = () => http.get('/servo').then((r) => r.data)

// GET /api/pump — trạng thái bơm & bể nước
export const getPump = () => http.get('/pump').then((r) => r.data)

// GET /api/logs — lịch sử sự kiện
export const getLogs = () => http.get('/logs').then((r) => r.data)

// GET /api/dashboard — snapshot tổng hợp (gộp tất cả ở trên)
export const getDashboard = () => http.get('/dashboard').then((r) => r.data)

/* ---------------- POST endpoints --------------- */

// POST /api/servo {pan, tilt}
export const postServo = (pan, tilt) => http.post('/servo', { pan, tilt }).then((r) => r.data)

// POST /api/pump {on, flowRate, pressure}
export const postPump = (payload) => http.post('/pump', payload).then((r) => r.data)

// POST /api/mode {auto}
export const postMode = (auto) => http.post('/mode', { auto }).then((r) => r.data)

// POST /api/alert {level}  — kích hoạt cảnh báo / lệnh điều khiển
export const postAlert = (level) => http.post('/alert', { level }).then((r) => r.data)

export default http
