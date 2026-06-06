import { useFss } from '../../context/FssContext'
import { SENSOR_ANGLES, SENSOR_IDS } from '../../data/constants'
import useElementSize from '../../hooks/useElementSize'

/**
 * ServoTrackingMap — bản đồ cung 180° hiển thị 7 cảm biến, vị trí servo
 * (crosshair) và vùng nhiệt (heat overlay). Toàn bộ toạ độ được tính lại
 * bằng React dựa trên kích thước thực của khung (thay cho thao tác DOM cũ).
 */
export default function ServoTrackingMap() {
  const { state } = useFss()
  const [mapRef, { w, h }] = useElementSize()

  // Hình học cung tròn
  const cx = w / 2
  const cy = h * 0.82
  const r = Math.min(w * 0.42, h * 0.62)

  const polar = (deg, radius = r) => {
    const rad = ((180 - deg) * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) }
  }

  // Toạ độ các cảm biến
  const sensorPos = {}
  SENSOR_IDS.forEach((id) => (sensorPos[id] = polar(SENSOR_ANGLES[id])))

  // Đường cung + nhãn độ
  const start = polar(180)
  const end = polar(0)
  const arcPath = w ? `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}` : ''

  // Crosshair theo pan/tilt
  const tiltFactor = 0.3 + 0.7 * (state.tilt / 90)
  const cross = polar(state.pan, r * tiltFactor)

  // Heat overlay (trung bình vị trí các cảm biến đang cháy)
  const fired = SENSOR_IDS.filter((id) => state.sensors[id])
  let heat = { show: false, cx: 0, cy: 0, rx: 0, ry: 0 }
  if (fired.length > 0) {
    const sum = fired.reduce((acc, id) => ({ x: acc.x + sensorPos[id].x, y: acc.y + sensorPos[id].y }), { x: 0, y: 0 })
    heat = {
      show: true,
      cx: sum.x / fired.length,
      cy: sum.y / fired.length,
      rx: 60 + fired.length * 20,
      ry: 40 + fired.length * 15,
    }
  }

  // Trạng thái vùng
  let zoneStatus = 'NO FIRE'
  if (state.alertLevel === 3) zoneStatus = 'FIRE — ALL SENSORS'
  else if (state.alertLevel > 0) zoneStatus = 'FIRE — ' + fired.map((id) => id.toUpperCase()).join('/')

  const pct = (v, total) => (total ? (v / total) * 100 + '%' : '50%')

  return (
    <div className="zone-wrap" id="servo-tracking-wrap">
      <div className="panel-hdr">
        <div className="panel-hdr-left">
          <div className="panel-hdr-icon"></div>
          Servo Tracking — Pan-Tilt Position
        </div>
        <span
          id="zone-status"
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: '10px',
            fontWeight: 500,
            color: state.alertLevel > 0 ? 'var(--danger)' : 'var(--text3)',
          }}
        >
          {zoneStatus}
        </span>
      </div>

      <div className="zone-map" id="zone-map" ref={mapRef}>
        {/* SVG: cung + heat overlay */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          <defs>
            <radialGradient id="heat-grad-1" cx="50%" cy="70%" r="40%">
              <stop offset="0%" stopColor="#ff5d5d" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#ff5d5d" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d={arcPath} fill="none" stroke="var(--info)" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.5" />
          {w > 0 && (
            <>
              <text x={start.x} y={start.y + 16} fontSize="10" fontFamily="'DM Mono',monospace" fill="var(--text3)" textAnchor="middle">0°</text>
              <text x={cx} y={cy - r - 8} fontSize="10" fontFamily="'DM Mono',monospace" fill="var(--text3)" textAnchor="middle">90°</text>
              <text x={end.x} y={end.y + 16} fontSize="10" fontFamily="'DM Mono',monospace" fill="var(--text3)" textAnchor="middle">180°</text>
            </>
          )}
          <ellipse
            cx={heat.cx}
            cy={heat.cy}
            rx={heat.rx}
            ry={heat.ry}
            fill="url(#heat-grad-1)"
            opacity={heat.show ? 1 : 0}
            style={{ transition: 'opacity .5s' }}
          />
        </svg>

        {/* Các nút cảm biến S0–S6 */}
        {SENSOR_IDS.map((id) => {
          const fire = state.sensors[id]
          const p = sensorPos[id]
          return (
            <div
              key={id}
              className={`arc-sensor${fire ? ' fire' : ''}`}
              style={{ left: pct(p.x, w), top: pct(p.y, h), transform: 'translate(-50%,-50%)' }}
            >
              <div className="sensor-id">{id.toUpperCase()}</div>
              <div className={`sensor-status ${fire ? 'fire' : 'ok'}`}>{fire ? '🔥 FIRE' : 'Normal'}</div>
            </div>
          )
        })}

        {/* Crosshair servo */}
        <div
          className="servo-crosshair"
          style={{ left: pct(cross.x, w), top: pct(cross.y, h), transform: 'translate(-50%,-50%)' }}
        >
          <div className="sc-h"></div>
          <div className="sc-v"></div>
          <div className="sc-dot"></div>
        </div>

        {/* Nhãn pan-tilt */}
        <div
          className="pan-tilt-label"
          style={{ left: `${cx}px`, bottom: `${h - cy + 10}px`, transform: 'translateX(-50%)' }}
        >
          PAN-TILT POSITION
        </div>
      </div>
    </div>
  )
}
