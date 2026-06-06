import { useFss } from '../../context/FssContext'
import { fmtUptime } from '../../data/constants'

/**
 * StatusBlocks — 4 khối trạng thái: Servo, System, Uptime, Clients.
 */
export default function StatusBlocks() {
  const { state, derived } = useFss()
  const uptime = fmtUptime(derived.uptimeSec)

  return (
    <div className="status-blocks">
      {/* Servo Status */}
      <div className="status-block">
        <div className="sb-title">Servo Status</div>
        <div className="sb-row"><span className="sb-label">Pan:</span><span className="sb-val ok">{state.pan}° OK</span></div>
        <div className="sb-row"><span className="sb-label">Tilt:</span><span className="sb-val ok">{state.tilt}° OK</span></div>
      </div>

      {/* System Status */}
      <div className="status-block">
        <div className="sb-title">System Status</div>
        <div className="sb-row"><span className="sb-label">ESP32:</span><span className="sb-val ok">Online</span></div>
        <div className="sb-row"><span className="sb-label">MQTT:</span><span className="sb-val ok">Connected</span></div>
        <div className="sb-row"><span className="sb-label">Database:</span><span className="sb-val ok">Synced</span></div>
      </div>

      {/* Uptime */}
      <div className="status-block">
        <div className="sb-title">Uptime</div>
        <div className="sb-big">{uptime}</div>
      </div>

      {/* Clients */}
      <div className="status-block">
        <div className="sb-title">Clients</div>
        <div className="sb-big">5/5 Online</div>
        <div className="client-dots">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="client-dot" key={i}></div>
          ))}
        </div>
      </div>
    </div>
  )
}
