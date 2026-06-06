import { useState } from 'react'
import { useFss } from '../../../context/FssContext'
import { exportIncidentsCSV } from '../../../utils/exporters'

const FILTERS = [
  { id: 'all', label: 'ALL' },
  { id: 'CRIT', label: 'CRIT' },
  { id: 'L2', label: 'L2' },
  { id: 'L1', label: 'L1' },
]

const levelColor = (lvl) => (lvl === 'CRIT' ? 'var(--danger)' : lvl === 'L2' ? 'var(--warn)' : 'var(--info)')
const levelBg = (lvl) =>
  lvl === 'CRIT'
    ? 'rgba(255,93,93,0.15)'
    : lvl === 'L2'
    ? 'rgba(229,160,0,0.15)'
    : 'rgba(59,130,246,0.15)'

/**
 * IncidentsPane — danh sách sự cố đã ghi nhận, có lọc theo cấp độ + xuất CSV.
 */
export default function IncidentsPane() {
  const { state, actions } = useFss()
  const [filter, setFilter] = useState('all')

  const filtered = state.incidents.filter((i) => filter === 'all' || i.level === filter)

  let body
  if (state.incidents.length === 0) {
    body = <div className="inc-empty">No incidents recorded</div>
  } else if (filtered.length === 0) {
    body = <div className="inc-empty">No matches</div>
  } else {
    body = filtered.map((inc) => (
      <div className="inc-item" key={inc.id} style={{ borderLeft: `3px solid ${levelColor(inc.level)}`, paddingLeft: '9px', marginBottom: '6px' }}>
        <div className="inc-hdr">
          <span className="inc-id" style={{ fontWeight: 600 }}>#{inc.id}</span>
          <span
            className="inc-level-badge"
            style={{ fontSize: '8px', fontWeight: 700, padding: '1px 4px', borderRadius: '3px', fontFamily: "'DM Mono',monospace", background: levelBg(inc.level), color: levelColor(inc.level) }}
          >
            {inc.level}
          </span>
          <span className="inc-zone" style={{ fontSize: '9px', color: 'var(--text2)', fontFamily: "'DM Mono',monospace" }}>{inc.zone}</span>
        </div>
        <div className="inc-row" style={{ marginTop: '4px' }}>
          Temp: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{inc.maxTemp.toFixed(1)}°C</span>&nbsp;
          Water: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{inc.waterUsed.toFixed(1)}L</span>&nbsp;
          Response: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{(inc.responseTime / 1000).toFixed(1)}s</span>
        </div>
        <div className="inc-res" style={{ color: 'var(--ok)', fontSize: '9px', fontWeight: 600, marginTop: '2px' }}>
          ✓ {inc.result} at {inc.startStr}
        </div>
      </div>
    ))
  }

  const handleExport = () => {
    if (exportIncidentsCSV(state.incidents)) {
      actions.addEvent('📊', 'Incidents list exported to CSV', false, 'info')
    }
  }

  return (
    <div className="tab-pane active" id="pane-incidents">
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', flexShrink: 0 }}>
        <span style={{ fontSize: '8px', color: 'var(--text3)', fontFamily: "'DM Mono',monospace", letterSpacing: '0.5px', flexShrink: 0 }}>FILTER:</span>
        {FILTERS.map((f) => (
          <button key={f.id} className={`inc-filter-btn${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
        <div style={{ flex: 1 }}></div>
        <button className="inc-export-btn" onClick={handleExport} title="Export CSV">⬇ CSV</button>
      </div>
      <div id="incident-list" style={{ paddingBottom: '8px' }}>{body}</div>
    </div>
  )
}
