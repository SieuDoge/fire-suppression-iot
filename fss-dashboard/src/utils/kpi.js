import { SENSOR_IDS, fmtMs } from '../data/constants'

/* Các hàm thuần (pure) suy ra giá trị hiển thị từ state — thay cho
   việc cập nhật DOM rải rác trong bản gốc. */

export const tempClass = (t) => (t < 40 ? 'ok' : t < 80 ? 'warn' : 'danger')

export function threat(temp) {
  const pct = Math.min(100, Math.round((temp / 150) * 100))
  const cls = pct <= 30 ? 'ok' : pct <= 60 ? 'warn' : 'danger'
  const label = pct <= 30 ? 'SAFE' : pct <= 60 ? 'WARNING' : pct <= 80 ? 'DANGER' : 'CRITICAL'
  return { pct, cls, label }
}

export function water(state) {
  const pct = Math.round((state.waterL / state.totalWater) * 100)
  const cls = pct < 20 ? 'danger' : pct < 50 ? 'warn' : 'info'
  const barColor = pct < 20 ? 'var(--danger)' : pct < 50 ? 'var(--warn)' : 'var(--info)'
  return { pct, cls, barColor }
}

export function health(state) {
  if (state.alertLevel === 0) {
    return { cls: 'ok', text: 'NORMAL', sub: 'All sensors clear' }
  }
  const fired = SENSOR_IDS.filter((id) => state.sensors[id]).length
  const text = state.alertLevel === 1 ? 'ALERT L1' : state.alertLevel === 2 ? 'DANGER L2' : 'CRITICAL'
  return { cls: state.alertLevel < 3 ? 'warn' : 'danger', text, sub: `${fired} sensors triggered` }
}

// Trạng thái tổng (status pill / bottom bar)
export function systemStatus(alertLevel) {
  if (alertLevel === 0) return { cls: 'ok', text: 'NORMAL' }
  if (alertLevel === 1) return { cls: 'warn', text: 'ALERT L1' }
  if (alertLevel === 2) return { cls: 'danger', text: 'DANGER L2' }
  return { cls: 'danger', text: '☢ CRITICAL' }
}

export function dangerBadge(alertLevel) {
  if (alertLevel === 1) return 'DANGER L1'
  if (alertLevel === 2) return 'DANGER L2'
  if (alertLevel === 3) return '☢ CRITICAL'
  return 'DANGER L2'
}

export function avgResponse(totalResponses) {
  if (totalResponses.length === 0) return { val: '—', sub: 'no events yet' }
  const avg = Math.round(totalResponses.reduce((a, b) => a + b, 0) / totalResponses.length)
  return { val: fmtMs(avg), sub: `from ${totalResponses.length} events` }
}

// Danh sách cảm biến đang báo cháy (vd: ["S1","S2"])
export const triggeredList = (sensors) =>
  SENSOR_IDS.filter((id) => sensors[id]).map((id) => id.toUpperCase())
