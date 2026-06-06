import { useState, useEffect, useRef, useCallback } from 'react'
import {
  SENSOR_ANGLES,
  SENSOR_IDS,
  PRESSURE_FLOW,
  createInitialState,
} from '../data/constants'
import { USE_REAL_API, POLL_INTERVAL, postServo, postPump, postMode, postAlert, getDashboard } from '../services/api'

/* ============================================================
   useFssSystem — Nguồn dữ liệu trung tâm của Dashboard.

   Thay thế hoàn toàn object `state` toàn cục + các hàm thao tác
   DOM (getElementById...) trong bản HTML gốc bằng React state.

   - Chạy mô phỏng (simulation) khi USE_REAL_API = false.
   - Khi USE_REAL_API = true: polling GET /api/dashboard mỗi
     POLL_INTERVAL ms và đồng bộ dữ liệu thật vào state.
   ============================================================ */
export default function useFssSystem() {
  const [state, setState] = useState(createInitialState)
  // now: nhịp đồng hồ 1s, dùng để suy ra uptime / elapsed
  const [now, setNow] = useState(Date.now())

  // Giữ bản state mới nhất cho các callback chạy trong setTimeout
  const stateRef = useRef(state)
  stateRef.current = state

  // Helper: thêm 1 sự kiện vào timeline (mới nhất ở đầu, tối đa 30)
  const pushEvent = (prev, icon, text, bold = false, type = 'info') => {
    const time = new Date().toTimeString().slice(0, 8)
    const events = [{ icon, text, bold, type, time, key: prev.eventCount + 1 }, ...prev.events].slice(0, 30)
    return { events, eventCount: prev.eventCount + 1 }
  }

  const addEvent = useCallback((icon, text, bold = false, type = 'info') => {
    setState((prev) => ({ ...prev, ...pushEvent(prev, icon, text, bold, type) }))
  }, [])

  /* ---------------- Đồng hồ + nhịp 1 giây ---------------- */
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  /* ---------------- Mô phỏng nhiệt độ + bơm (1s) -------- */
  useEffect(() => {
    if (USE_REAL_API) return // dùng dữ liệu thật => không mô phỏng
    const id = setInterval(() => {
      setState((prev) => {
        // Nhiệt độ theo mức cảnh báo + nhiễu ngẫu nhiên
        const base =
          prev.alertLevel === 0 ? 28.5 : prev.alertLevel === 1 ? 75 : prev.alertLevel === 2 ? 110 : 140
        const temp = base + (Math.random() - 0.5) * 3

        const tempHistory = [...prev.tempHistory, temp].slice(-120)
        const panHistory = [...prev.panHistory, prev.pan].slice(-60)
        const tiltHistory = [...prev.tiltHistory, prev.tilt].slice(-60)

        // Bơm tiêu hao nước
        let { waterUsed, waterL, pumpOn, flowRate } = prev
        let extra = null
        if (pumpOn) {
          const rate = PRESSURE_FLOW[prev.pressure] ?? 80
          flowRate = rate
          waterUsed = Math.min(prev.totalWater, waterUsed + rate / 60)
          waterL = Math.max(0, prev.totalWater - waterUsed)
          if (waterL <= 0) {
            pumpOn = false
            extra = pushEvent(prev, '⚠️', 'Water empty — Pump automatically deactivated', true, 'warn')
          }
        }

        return {
          ...prev,
          temp,
          tempHistory,
          panHistory,
          tiltHistory,
          waterUsed,
          waterL,
          pumpOn,
          flowRate,
          ...(extra || {}),
        }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  /* ---------------- Polling API thật (tuỳ chọn) --------- */
  useEffect(() => {
    if (!USE_REAL_API) return
    let active = true
    const poll = async () => {
      try {
        const d = await getDashboard()
        if (!active || !d) return
        setState((prev) => ({
          ...prev,
          temp: d.temp ?? prev.temp,
          pan: d.pan ?? prev.pan,
          tilt: d.tilt ?? prev.tilt,
          pumpOn: d.pumpOn ?? prev.pumpOn,
          pressure: d.pressure ?? prev.pressure,
          flowRate: d.flowRate ?? prev.flowRate,
          waterL: d.waterL ?? prev.waterL,
          waterUsed: d.waterUsed ?? prev.waterUsed,
          alertLevel: d.alertLevel ?? prev.alertLevel,
          sensors: d.sensors ?? prev.sensors,
          tempHistory: [...prev.tempHistory, d.temp ?? prev.temp].slice(-120),
          panHistory: [...prev.panHistory, d.pan ?? prev.pan].slice(-60),
          tiltHistory: [...prev.tiltHistory, d.tilt ?? prev.tilt].slice(-60),
        }))
      } catch {
        /* lỗi đã được log ở interceptor */
      }
    }
    poll()
    const id = setInterval(poll, POLL_INTERVAL)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  /* ---------------- Sự kiện khởi động (boot) ------------ */
  useEffect(() => {
    const t1 = setTimeout(() => addEvent('📡', 'MQTT broker connected — fss/sensors', false, 'info'), 800)
    const t2 = setTimeout(() => addEvent('💾', 'Database sync OK', false, 'info'), 1600)
    const t3 = setTimeout(() => addEvent('⚙', 'All subsystems operational — FSS V5 ready', true, 'info'), 2400)
    // sự kiện khởi tạo ban đầu
    addEvent('⚙', 'System initialized', true, 'info')
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ====================== ACTIONS ====================== */

  const toggleMode = useCallback(() => {
    setState((prev) => {
      const isAutoMode = !prev.isAutoMode
      if (USE_REAL_API) postMode(isAutoMode).catch(() => {})
      return {
        ...prev,
        isAutoMode,
        ...pushEvent(prev, '⚙', `System mode changed to ${isAutoMode ? 'AUTO MODE' : 'MANUAL MODE'}`, true, 'info'),
      }
    })
  }, [])

  const updateServo = useCallback((axis, val, api = true) => {
    val = parseInt(val, 10)
    setState((prev) => {
      const next = axis === 'pan' ? { ...prev, pan: val } : { ...prev, tilt: val }
      if (api && USE_REAL_API) postServo(next.pan, next.tilt).catch(() => {})
      return next
    })
  }, [])

  const nudgeServo = useCallback((axis, d) => {
    setState((prev) => {
      if (prev.isAutoMode) return prev
      if (axis === 'pan') {
        const v = Math.max(0, Math.min(180, prev.pan + d))
        if (USE_REAL_API) postServo(v, prev.tilt).catch(() => {})
        return { ...prev, pan: v, ...pushEvent(prev, '⚙', `Servo PAN manually nudged ${d > 0 ? '+' : ''}${d}° (now: ${v}°)`, false, 'info') }
      }
      const v = Math.max(0, Math.min(90, prev.tilt + d))
      if (USE_REAL_API) postServo(prev.pan, v).catch(() => {})
      return { ...prev, tilt: v, ...pushEvent(prev, '⚙', `Servo TILT manually nudged ${d > 0 ? '+' : ''}${d}° (now: ${v}°)`, false, 'info') }
    })
  }, [])

  const trackTarget = useCallback(() => {
    setState((prev) => {
      if (prev.isAutoMode) return prev
      const active = SENSOR_IDS.filter((id) => prev.sensors[id])
      if (active.length === 0) {
        return { ...prev, ...pushEvent(prev, '⚠️', 'Manual track failed: No active fire targets', false, 'warn') }
      }
      const sum = active.reduce((a, id) => a + SENSOR_ANGLES[id], 0)
      const targetPan = Math.round(sum / active.length)
      const targetTilt = Math.min(90, 30 + active.length * 10)
      if (USE_REAL_API) postServo(targetPan, targetTilt).catch(() => {})
      return {
        ...prev,
        pan: targetPan,
        tilt: targetTilt,
        tracking: true,
        targetLocked: true,
        ...pushEvent(prev, '🎯', `Manual track: Locked onto S-avg (${targetPan}°/${targetTilt}°)`, true, 'warn'),
      }
    })
  }, [])

  const centerServo = useCallback(() => {
    setState((prev) => {
      if (prev.isAutoMode) return prev
      if (USE_REAL_API) postServo(90, 45).catch(() => {})
      return { ...prev, pan: 90, tilt: 45, tracking: false, targetLocked: false, ...pushEvent(prev, '⊕', 'Servo centered manually (90°/45°)', false, 'info') }
    })
  }, [])

  const resetServo = useCallback(() => {
    setState((prev) => {
      if (prev.isAutoMode) return prev
      if (USE_REAL_API) postServo(90, 0).catch(() => {})
      return { ...prev, pan: 90, tilt: 0, tracking: false, targetLocked: false, ...pushEvent(prev, '⌂', 'Servo returned to home (90°/0°)', false, 'info') }
    })
  }, [])

  const togglePumpManual = useCallback(() => {
    setState((prev) => {
      if (prev.isAutoMode) return prev
      const pumpOn = !prev.pumpOn
      if (USE_REAL_API) postPump({ on: pumpOn, flowRate: prev.flowRate, pressure: prev.pressure }).catch(() => {})
      return { ...prev, pumpOn, ...pushEvent(prev, '⚙', `Operator manually toggled Pump ${pumpOn ? 'ON' : 'OFF'}`, true, 'info') }
    })
  }, [])

  const setPumpPressure = useCallback((level) => {
    setState((prev) => {
      if (prev.isAutoMode) return prev
      const flowRate = PRESSURE_FLOW[level]
      if (USE_REAL_API) postPump({ on: prev.pumpOn, flowRate, pressure: level }).catch(() => {})
      return { ...prev, pressure: level, flowRate, ...pushEvent(prev, '⚙', `Operator set Pump pressure to ${level} (${flowRate} L/min)`, false, 'info') }
    })
  }, [])

  // Kích hoạt cảnh báo theo cấp độ 1/2/3
  const triggerAlert = useCallback((level) => {
    setState((prev) => {
      if (prev.alertLevel === level) return prev

      const det = Math.floor(80 + Math.random() * 100)
      const srv = det + Math.floor(1100 + Math.random() * 800)
      const pmp = srv + Math.floor(800 + Math.random() * 900)

      const sensors = { ...prev.sensors }
      let next = {
        ...prev,
        alertLevel: level,
        eventsToday: prev.eventsToday + 1,
        fireStartTime: Date.now(),
        incidentWaterStart: prev.waterUsed,
        rtDetection: det,
        rtServoTrack: srv,
        rtPumpActivation: pmp,
        totalResponses: [...prev.totalResponses, pmp],
        tracking: true,
        targetLocked: true,
      }

      let ev
      if (level === 1) {
        sensors.s1 = true
        sensors.s2 = true
        ev = pushEvent(next, '🔥', 'ALERT L1 — Fire detected on S1/S2', true, 'fire')
        if (prev.isAutoMode) {
          next = { ...next, pumpOn: true, pressure: 'LOW', flowRate: 40, pan: 60, tilt: 35 }
        }
      } else if (level === 2) {
        sensors.s1 = true
        sensors.s2 = true
        sensors.s3 = true
        ev = pushEvent(next, '🔥', 'ALERT L2 — Fire spreading on S1/S2/S3', true, 'fire')
        if (prev.isAutoMode) {
          next = { ...next, pumpOn: true, pressure: 'MEDIUM', flowRate: 80, pan: 85, tilt: 55 }
        }
      } else {
        SENSOR_IDS.forEach((id) => (sensors[id] = true))
        ev = pushEvent(next, '☢', 'CRITICAL — All fire sensors triggered', true, 'fire')
        if (prev.isAutoMode) {
          next = { ...next, pumpOn: true, pressure: 'HIGH', flowRate: 120, pan: 90, tilt: 60 }
        }
      }

      if (USE_REAL_API) postAlert(level).catch(() => {})
      return { ...next, sensors, ...ev }
    })

    // Sự kiện phụ phát sinh sau (delayed)
    if (level === 2) {
      setTimeout(() => addEvent('💧', 'Auto pump engaged — 80 L/min', true, 'warn'), 600)
    } else if (level === 3) {
      setTimeout(() => addEvent('🔔', 'Evacuation alarm activated', true, 'warn'), 1000)
    }
  }, [addEvent])

  const suppressAlert = useCallback(() => {
    // ACK — chỉ ghi nhận, không tắt cảnh báo (giống bản gốc)
    addEvent('⚙', 'Alert acknowledged (ACK) by operator', false, 'info')
  }, [addEvent])

  const extinguishFire = useCallback(() => {
    setState((prev) => {
      const elapsed = Math.round((Date.now() - (prev.fireStartTime || Date.now())) / 1000)
      const waterUsedThisIncident = prev.waterUsed - (prev.incidentWaterStart || 0)

      let incidents = prev.incidents
      let incidentCounter = prev.incidentCounter
      if (prev.alertLevel > 0) {
        incidentCounter += 1
        const levelStr = prev.alertLevel === 1 ? 'L1' : prev.alertLevel === 2 ? 'L2' : 'CRIT'
        const zoneStr =
          SENSOR_IDS.filter((id) => prev.sensors[id]).map((id) => id.toUpperCase()).join('/') || 'Sensors'
        incidents = [
          {
            id: String(incidentCounter).padStart(3, '0'),
            zone: zoneStr,
            maxTemp: prev.temp,
            waterUsed: waterUsedThisIncident,
            responseTime: elapsed * 1000,
            level: levelStr,
            rtDetection: prev.rtDetection,
            rtServoTrack: prev.rtServoTrack,
            rtPumpActivation: prev.rtPumpActivation,
            startStr: new Date().toTimeString().slice(0, 8),
            result: 'SUPPRESSED',
          },
          ...prev.incidents,
        ]
      }

      const sensors = {}
      SENSOR_IDS.forEach((id) => (sensors[id] = false))

      return {
        ...prev,
        alertLevel: 0,
        tracking: false,
        targetLocked: false,
        sensors,
        pumpOn: false,
        incidents,
        incidentCounter,
        ...pushEvent(
          prev,
          '✅',
          `Fire suppressed — response: ${elapsed}s — water: ${waterUsedThisIncident.toFixed(1)}L — system restored`,
          true,
          'info'
        ),
      }
    })
  }, [])

  // Tiện ích đồng hồ / uptime suy ra từ `now`
  const uptimeSec = Math.floor((now - state.uptimeStart) / 1000)
  const elapsedSec =
    state.alertLevel > 0 && state.fireStartTime ? Math.floor((now - state.fireStartTime) / 1000) : 0

  return {
    state,
    derived: { uptimeSec, elapsedSec, now },
    actions: {
      toggleMode,
      updateServo,
      nudgeServo,
      trackTarget,
      centerServo,
      resetServo,
      togglePumpManual,
      setPumpPressure,
      triggerAlert,
      suppressAlert,
      extinguishFire,
      addEvent,
      setState,
    },
  }
}
