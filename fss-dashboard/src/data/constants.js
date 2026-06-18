/* ============================================================
   constants.js — Hằng số dùng chung cho hệ thống FSS·CTRL
   ============================================================ */

// Vị trí 7 cảm biến trên cung 180° (đơn vị: độ)
export const SENSOR_ANGLES = {
  s0: 0,
  s1: 30,
  s2: 60,
  s3: 90,
  s4: 120,
  s5: 150,
  s6: 180,
}

export const SENSOR_IDS = Object.keys(SENSOR_ANGLES)

// Lưu lượng theo từng mức áp suất (L/min)
export const PRESSURE_FLOW = { LOW: 40, MEDIUM: 80, HIGH: 120 }

// Thông điệp chạy ở thanh ticker dưới cùng
export const TICKER_MSGS = [
  'FSS v5 — System operational — all subsystems nominal — 0 active alerts',
  'MLX90614 IR sensor online — polling at 500ms — ESP32 stable — MQTT broker active',
  'Servo initialized — Pan:90° Tilt:0° — Pump on standby — S0-S6 sensors clear',
  'POST /api/servo {pan,tilt} · POST /api/pump {flowRate,pressure,on} · GET /api/dashboard',
]

// Trạng thái khởi tạo của toàn hệ thống (tương ứng object `state` trong bản gốc)
export function createInitialState() {
  return {
    temp: 28.5,
    pan: 90,
    tilt: 0,
    pumpOn: false,
    alertLevel: 0,
    eventCount: 0,
    uptimeStart: Date.now(),
    tempHistory: [],
    panHistory: [],
    tiltHistory: [],
    eventsToday: 0,
    fireStartTime: null,
    incidentWaterStart: 0,
    waterL: 200,
    totalWater: 200,
    waterUsed: 0,
    flowRate: 70,
    pressure: 'MEDIUM',
    totalResponses: [],
    incidents: [],
    incidentCounter: 0,
    isAutoMode: true,
    sensors: { s0: false, s1: false, s2: false, s3: false, s4: false, s5: false, s6: false },
    tracking: false,
    targetLocked: false,
    rtDetection: 0,
    rtServoTrack: 0,
    rtPumpActivation: 0,
    // Timeline events (mới nhất ở đầu mảng)
    events: [],
    buzzerOn: false,
  }
}

// Định dạng mili-giây -> chuỗi ngắn gọn
export const fmtMs = (ms) => (ms < 1000 ? ms + 'ms' : (ms / 1000).toFixed(1) + 's')

// Định dạng giây -> HH:MM:SS
export const fmtUptime = (totalSec) => {
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
  const s = String(totalSec % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export const fmtClock = () => new Date().toTimeString().slice(0, 8)
