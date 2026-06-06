import { useFss } from '../../context/FssContext'
import { SENSOR_IDS } from '../../data/constants'

/**
 * SensorPanel — lưới 7 chip cảm biến S0–S6, đổi màu khi báo cháy.
 */
export default function SensorPanel() {
  const { state } = useFss()

  return (
    <div className="sensor-panel" id="sensor-panel">
      <div className="panel-hdr">
        <div className="panel-hdr-left">
          <div className="panel-hdr-icon" style={{ background: 'var(--ok)', boxShadow: '0 0 0 3px rgba(34,197,94,0.15)' }}></div>
          Sensor Status
        </div>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', fontWeight: 500, color: 'var(--text3)' }}>
          7 sensors
        </span>
      </div>

      <div style={{ padding: '8px 12px 10px', display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
        {SENSOR_IDS.map((id) => {
          const fire = state.sensors[id]
          return (
            <div className={`sensor-chip ${fire ? 'fire' : 'normal'}`} key={id}>
              <div className={`sc-dot-ind ${fire ? 'fire' : 'ok'}`}></div>
              <div className="sc-name">{id.toUpperCase()}</div>
              <div className={`sc-lbl ${fire ? 'fire' : 'ok'}`}>{fire ? 'FIRE' : 'Normal'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
