import { useFss } from '../../context/FssContext'
import { fmtUptime } from '../../data/constants'
import { USE_REAL_API } from '../../services/api'

/**
 * StatusBlocks — 4 khối trạng thái: Servo, System, Uptime, Clients.
 * Hiển thị dữ liệu thật khi USE_REAL_API = true.
 */
export default function StatusBlocks() {
  const { state, derived } = useFss()
  const uptime = fmtUptime(derived.uptimeSec)
  const ws = derived.wsConnected

  // Xác định trạng thái hệ thống thực tế
  // ESP32 gửi dữ liệu cảm biến liên tục (khoảng vài trăm ms), nếu quá 15s không nhận được -> offline
  const ESP32_TIMEOUT_MS = 15000;
  const espOnline = state.lastEsp32Heartbeat 
    ? (Date.now() - state.lastEsp32Heartbeat < ESP32_TIMEOUT_MS) 
    : false;
    
  const mqttOk = USE_REAL_API ? ws : true
  const dbOk = USE_REAL_API // nếu polling thành công thì DB OK

  // Clients: ESP32, Backend, WebSocket
  const clients = [
    { name: 'ESP32 (Hardware)', online: espOnline },
    { name: 'Backend (API)', online: dbOk },
    { name: 'WebSocket (STOMP)', online: ws },
  ]
  const onlineCount = clients.filter(c => c.online).length

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
        <div className="sb-row">
          <span className="sb-label">ESP32:</span>
          <span className={`sb-val ${espOnline ? 'ok' : 'err'}`}>{espOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div className="sb-row">
          <span className="sb-label">MQTT:</span>
          <span className={`sb-val ${mqttOk ? 'ok' : 'err'}`}>{mqttOk ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="sb-row">
          <span className="sb-label">Database:</span>
          <span className={`sb-val ${dbOk ? 'ok' : 'err'}`}>{dbOk ? 'Synced' : 'Offline'}</span>
        </div>
      </div>

      {/* Uptime */}
      <div className="status-block">
        <div className="sb-title">Uptime</div>
        <div className="sb-big">{uptime}</div>
      </div>

      {/* Clients */}
      <div className="status-block">
        <div className="sb-title">Clients</div>
        <div className="sb-big">{onlineCount}/{clients.length} Online</div>
        <div className="client-dots">
          {clients.map((c, i) => (
            <div
              className={`client-dot${c.online ? '' : ' offline'}`}
              key={i}
              title={`${c.name}: ${c.online ? 'Online' : 'Offline'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
