import { useFss } from '../../context/FssContext'
import { triggeredList } from '../../utils/kpi'

/**
 * TrackingBar — dải thông tin theo dõi: góc pan/tilt, trạng thái tracking,
 * target locked, cảm biến kích hoạt và vị trí.
 */
export default function TrackingBar() {
  const { state } = useFss()
  const triggered = triggeredList(state.sensors)

  return (
    <div className="tracking-bar" id="tracking-bar">
      <div className="track-cell">
        <div className="track-cell-label">Pan Angle</div>
        <div className="track-cell-val blue">{state.pan}°</div>
      </div>
      <div className="track-cell">
        <div className="track-cell-label">Tilt Angle</div>
        <div className="track-cell-val blue">{state.tilt}°</div>
      </div>
      <div className="track-cell">
        <div className="track-cell-label">Tracking</div>
        <div className={`track-badge ${state.tracking ? 'on' : 'off'}`}>{state.tracking ? 'ON' : 'OFF'}</div>
      </div>
      <div className="track-cell">
        <div className="track-cell-label">Target Locked</div>
        <div className={`track-badge ${state.targetLocked ? 'yes' : 'no'}`}>{state.targetLocked ? 'YES' : 'NO'}</div>
      </div>
      <div className="track-cell">
        <div className="track-cell-label">Triggered Sensors</div>
        <div
          className="track-cell-val danger"
          style={{ fontSize: '12px', color: triggered.length ? 'var(--danger)' : 'var(--text3)' }}
        >
          {triggered.length ? triggered.join(', ') : '—'}
        </div>
      </div>
      <div className="track-cell">
        <div className="track-cell-label">Tracking Position</div>
        <div className="track-cell-val" style={{ fontSize: '12px' }}>X:{state.pan} Y:{state.tilt}</div>
      </div>
    </div>
  )
}
