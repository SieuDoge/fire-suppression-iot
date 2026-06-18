import { useFss } from '../../context/FssContext'
import { useAuth } from '../../context/AuthContext'
import { water } from '../../utils/kpi'

/**
 * PumpControl — bảng điều khiển bơm: lưu lượng, mức áp suất, bể nước và
 * công tắc bật/tắt. Các nút chỉ hoạt động ở chế độ MANUAL.
 */
export default function PumpControl() {
  const { state, actions } = useFss()
  const { isAdmin } = useAuth()
  const w = water(state)
  const disabled = state.isAutoMode || !isAdmin
  const flowPct = state.pumpOn ? Math.min(100, (state.flowRate / 120) * 100) : 0

  return (
    <div className="pump-wrap" id="pump-wrap">
      <div className="panel-hdr">
        <div className="panel-hdr-left">
          <div className="panel-hdr-icon" style={{ background: 'var(--info)', boxShadow: '0 0 0 3px rgba(59,130,246,0.15)' }}></div>
          Pump Control
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={`track-badge ${state.pumpOn ? 'on' : 'off'}`} style={{ fontSize: '9px' }}>
            {state.pumpOn ? 'RUNNING' : 'STANDBY'}
          </span>
          <span className="future-badge">FUTURE FEATURE</span>
        </div>
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {/* Flow Rate */}
          <div className="pump-metric-card">
            <div className="pump-metric-icon">〰️</div>
            <div className="pump-metric-label">FLOW RATE</div>
            <div className="pump-metric-val">{state.pumpOn ? state.flowRate : 0} L/min</div>
            <div className="pump-metric-sub">
              <div className="pump-metric-bar-bg">
                <div className="pump-metric-bar-fill" style={{ width: flowPct + '%' }}></div>
              </div>
            </div>
            <div className="pump-metric-unavail">Unavailable</div>
            <div className="pump-metric-soon">Coming Soon</div>
          </div>

          {/* Pressure Mode */}
          <div className="pump-metric-card">
            <div className="pump-metric-icon">🔧</div>
            <div className="pump-metric-label">PRESSURE MODE</div>
            <div className="pump-metric-val">{state.pressure}</div>
            <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
              {['LOW', 'MEDIUM', 'HIGH'].map((lvl) => (
                <button
                  key={lvl}
                  className={`inc-filter-btn${state.pressure === lvl ? ' active' : ''}`}
                  style={{ flex: 1, padding: '3px 0', fontSize: '8px' }}
                  onClick={() => actions.setPumpPressure(lvl)}
                  disabled={disabled}
                >
                  {lvl === 'MEDIUM' ? 'MED' : lvl}
                </button>
              ))}
            </div>
            <div className="pump-metric-unavail">Unavailable</div>
            <div className="pump-metric-soon">Coming Soon</div>
          </div>

          {/* Water Tank */}
          <div className="pump-metric-card">
            <div className="pump-metric-icon">🪣</div>
            <div className="pump-metric-label">WATER TANK</div>
            <div className="pump-metric-val" style={{ fontSize: '11px' }}>
              {Math.round(state.waterL)} L / {state.totalWater} L
            </div>
            <div className="pump-metric-sub">
              <div className="pump-metric-bar-bg">
                <div className="pump-metric-bar-fill" style={{ width: w.pct + '%', background: w.barColor }}></div>
              </div>
            </div>
            <div className="pump-metric-unavail">{w.pct}% ({state.waterL.toFixed(1)}L)</div>
            <div className="pump-metric-soon">Coming Soon</div>
          </div>
        </div>

        {/* Toggle + state */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isAdmin ? (
            <button
              className={`str-btn ${state.pumpOn ? 'reset' : 'center'}`}
              style={{ flex: 1, padding: '6px 0' }}
              onClick={actions.togglePumpManual}
              disabled={state.isAutoMode}
            >
              {state.pumpOn ? 'TURN OFF' : 'TURN ON'}
            </button>
          ) : (
            <div style={{
              flex: 1, padding: '6px 0', textAlign: 'center',
              fontSize: '10px', color: 'var(--text3)',
              fontFamily: "'DM Mono', monospace",
              background: 'var(--surface2)', borderRadius: '6px',
              border: '1px solid var(--border)',
            }}>
              🔒 Admin only
            </div>
          )}
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'var(--text3)' }}>
            State:{' '}
            <span style={{ fontWeight: 600, color: state.pumpOn ? 'var(--ok)' : 'var(--text3)' }}>
              {state.pumpOn ? 'RUNNING' : 'STANDBY'}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
