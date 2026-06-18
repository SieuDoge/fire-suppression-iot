import { useNavigate } from 'react-router-dom'
import { useFss } from '../../context/FssContext'
import { useAuth } from '../../context/AuthContext'
import { fmtClock } from '../../data/constants'
import { tempClass, threat, water, health, systemStatus, dangerBadge, avgResponse } from '../../utils/kpi'

/**
 * Header — thanh trên cùng của Dashboard: logo, các KPI, nút mô phỏng,
 * công tắc chế độ AUTO/MANUAL, đồng hồ và nút đăng xuất.
 */
export default function Header() {
  const { state, actions } = useFss()
  const auth = useAuth()
  const navigate = useNavigate()

  const th = threat(state.temp)
  const w = water(state)
  const h = health(state)
  const sys = systemStatus(state.alertLevel)
  const resp = avgResponse(state.totalResponses)

  const handleLogout = () => {
    auth.logout()
    navigate('/')
  }

  return (
    <header>
      <div className="h-logo">
        <div className="logo-icon">🔥</div>
        <div>
          <div className="h-logo-text">FSS·CTRL</div>
          <div className="h-logo-v">v5.0</div>
        </div>
      </div>

      <div className="h-kpis">
        <div className={`hkpi ${tempClass(state.temp)}`}>
          <div className="hkpi-label">Temperature</div>
          <div className="hkpi-val">{state.temp.toFixed(1)}°C</div>
          <div className="hkpi-sub">{state.temp.toFixed(1)} MLX90614 IR</div>
        </div>
        <div className={`hkpi ${th.cls}`}>
          <div className="hkpi-label">Threat Level</div>
          <div className="hkpi-val">{th.pct}%</div>
          <div className="hkpi-sub">{th.label}</div>
        </div>
        <div className={`hkpi ${w.cls}`}>
          <div className="hkpi-label">Water Tank</div>
          <div className="hkpi-val">{Math.round(state.waterL)}L</div>
          <div className="hkpi-sub">{w.pct}% · {state.waterUsed.toFixed(1)} L used</div>
        </div>
        <div className={`hkpi ${h.cls}`}>
          <div className="hkpi-label">System State</div>
          <div className="hkpi-val">{h.text}</div>
          <div className="hkpi-sub">{h.sub}</div>
        </div>
        <div className="hkpi purple">
          <div className="hkpi-label">Avg Response</div>
          <div className="hkpi-val">{resp.val}</div>
          <div className="hkpi-sub">{resp.sub}</div>
        </div>
      </div>

      <div className="h-right">
        <div className={`danger-badge${state.alertLevel > 0 ? ' active' : ''}`}>
          {dangerBadge(state.alertLevel)}
        </div>
        <div className={`h-status-pill ${sys.cls}`}>
          <div className={`spill-dot ${sys.cls}`}></div>
          <span>{sys.text}</span>
        </div>

        <button
          className={`mode-btn ${state.isAutoMode ? 'auto' : 'manual'}`}
          onClick={actions.toggleMode}
        >
          {state.isAutoMode ? 'AUTO MODE' : 'MANUAL MODE'}
        </button>

        {/* User info & admin link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
          {auth.isAdmin && (
            <button
              className="sbtn l1"
              style={{ fontSize: '9px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => navigate('/admin')}
              title="Admin Panel"
            >
              ADMIN
            </button>
          )}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
            fontFamily: "'DM Mono', monospace", fontSize: '10px', lineHeight: '1.3'
          }}>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{auth.user || 'User'}</span>
            <span style={{ color: 'var(--text3)', textTransform: 'uppercase', fontSize: '8px' }}>{auth.role || 'viewer'}</span>
          </div>
        </div>

        <div className="h-clock">{fmtClock()}</div>
        <button className="btn-logout" title="Đăng xuất" onClick={handleLogout}>⏻</button>
      </div>
    </header>
  )
}
