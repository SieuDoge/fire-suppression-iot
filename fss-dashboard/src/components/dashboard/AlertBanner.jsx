import { useFss } from '../../context/FssContext'
import { triggeredList } from '../../utils/kpi'

const BANNERS = {
  1: { badge: 'ALERT L1', main: 'FIRE DETECTED', sub: 'Sensor triggered — suppression engaging' },
  2: { badge: 'ALERT L2', main: 'FIRE SPREADING', sub: 'Multiple sensors — pump engaged' },
  3: { badge: '☢ CRITICAL', main: 'ALL SENSORS CRITICAL', sub: 'Emergency protocol — all sensors triggered' },
}

/**
 * AlertBanner — dải cảnh báo hiện ra khi có sự cố cháy (alertLevel > 0).
 */
export default function AlertBanner() {
  const { state, derived, actions } = useFss()
  const active = state.alertLevel > 0
  const b = BANNERS[state.alertLevel] || BANNERS[2]

  const m = String(Math.floor(derived.elapsedSec / 60)).padStart(2, '0')
  const s = String(derived.elapsedSec % 60).padStart(2, '0')
  const sensorCount = triggeredList(state.sensors).length

  return (
    <div id="alert-banner" className={active ? 'active' : ''}>
      <div className="ab-badge">{b.badge}</div>
      <div className="ab-text">
        <div className="ab-main">{b.main}</div>
        <div className="ab-sub">{b.sub}</div>
      </div>
      <div className="ab-stats">
        <div className="abs">
          <div className="abs-v">{state.temp.toFixed(1)}°C</div>
          <div className="abs-l">Temp</div>
        </div>
        <div className="abs">
          <div className="abs-v">{sensorCount || '—'}</div>
          <div className="abs-l">Sensors</div>
        </div>
        <div className="abs">
          <div className="abs-v">{`${m}:${s}`}</div>
          <div className="abs-l">Elapsed</div>
        </div>
      </div>
      <div className="ab-btns">
        <button className="ab-btn ack" onClick={actions.suppressAlert}>ACK</button>
        <button className="ab-btn ext" onClick={actions.extinguishFire}>✓ Extinguished</button>
      </div>
    </div>
  )
}
