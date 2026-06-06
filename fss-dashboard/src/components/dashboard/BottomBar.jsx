import { useFss } from '../../context/FssContext'
import { fmtUptime } from '../../data/constants'
import { systemStatus } from '../../utils/kpi'

const STATUS_COLOR = { ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--danger)' }

/**
 * BottomBar — thanh trạng thái dưới cùng: trạng thái hệ thống, MQTT, uptime,
 * số sự kiện, thông tin cảnh báo và ticker chạy chữ.
 */
export default function BottomBar() {
  const { state, derived } = useFss()
  const sys = systemStatus(state.alertLevel)
  const color = STATUS_COLOR[sys.cls]
  const active = state.alertLevel > 0

  const m = String(Math.floor(derived.elapsedSec / 60)).padStart(2, '0')
  const s = String(derived.elapsedSec % 60).padStart(2, '0')
  const alertLevelText =
    state.alertLevel === 1 ? 'ALERT L1 ACTIVE' : state.alertLevel === 2 ? 'ALERT L2 ACTIVE' : '☢ CRITICAL ACTIVE'

  return (
    <div className="botbar">
      <div className="bb-cell">
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }}></div>
        <span style={{ color, fontWeight: 600 }}>{sys.text}</span>
      </div>
      <div className="bb-separator"></div>
      <div className="bb-cell">MQTT <span style={{ color: 'var(--ok)' }}>fss/sensors</span></div>
      <div className="bb-separator"></div>
      <div className="bb-cell">UPTIME <span>{fmtUptime(derived.uptimeSec)}</span></div>
      <div className="bb-separator"></div>
      <div className="bb-cell">{state.eventCount} events</div>
      <div className="bb-separator"></div>

      {active && (
        <div className="bb-cell" style={{ display: 'flex' }}>
          <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{alertLevelText}</span>
          <span style={{ marginLeft: '6px' }}>Elapsed</span>
          <span style={{ color: 'var(--danger)' }}>{`${m}:${s}`}</span>
          <span style={{ marginLeft: '6px' }}>Temp</span>
          <span style={{ color: 'var(--danger)' }}>{state.temp.toFixed(1)}°C</span>
          <span style={{ marginLeft: '6px' }}>Pump</span>
          <span style={{ color: 'var(--warn)' }}>{state.pumpOn ? 'ON' : 'OFF'}</span>
        </div>
      )}

      <div className="bb-scroll">
        <span style={{ fontWeight: 500, color: 'var(--text2)' }}>ESP32</span> ·{' '}
        <span style={{ color: 'var(--info)' }}>{active ? 'SERVO TRACKING' : 'SERVO IDLE'}</span> ·{' '}
        <span style={{ color: active ? 'var(--warn)' : 'var(--text3)' }}>{active ? 'PUMP AUTO ACTIVE' : 'PUMP STANDBY'}</span> ·{' '}
        <span style={{ color: 'var(--ok)' }}>MQTT OK</span>
      </div>
    </div>
  )
}
