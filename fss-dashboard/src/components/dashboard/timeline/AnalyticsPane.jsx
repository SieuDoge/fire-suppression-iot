import { useRef, useEffect, useState } from 'react'
import { useFss } from '../../../context/FssContext'
import { fmtMs, fmtUptime } from '../../../data/constants'
import { avgResponse } from '../../../utils/kpi'
import { exportDataCSV, copyDataJSON } from '../../../utils/exporters'

// Vẽ đường biểu đồ trên canvas (port từ drawLine bản gốc)
function drawLine(ctx, data, color, min, max) {
  const w = ctx.canvas.offsetWidth || ctx.canvas.width
  const h = ctx.canvas.offsetHeight || ctx.canvas.height
  ctx.canvas.width = w
  ctx.canvas.height = h
  if (!data.length) return
  ctx.clearRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(226,232,240,0.6)'
  ctx.lineWidth = 1
  for (let i = 0; i < 3; i++) {
    const y = Math.floor((h / 2) * i) + 0.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  const pts = data.slice(-60)
  const step = w / (pts.length - 1 || 1)
  ctx.beginPath()
  pts.forEach((v, i) => {
    const x = i * step
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.stroke()
  const last = pts.length - 1
  ctx.lineTo(last * step, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.globalAlpha = 0.1
  ctx.fillStyle = color
  ctx.fill()
  ctx.globalAlpha = 1
}

function RT({ label, value, pct, variant }) {
  return (
    <div className="rt-item">
      <div className="rt-lbl">{label}</div>
      <div className="rt-val">{value}</div>
      <div className="rt-bar">
        <div className={`rt-fill${variant ? ' ' + variant : ''}`} style={{ width: pct + '%' }}></div>
      </div>
    </div>
  )
}

/**
 * AnalyticsPane — thống kê phiên, biểu đồ nhiệt độ & servo, thời gian phản ứng.
 */
export default function AnalyticsPane() {
  const { state, derived } = useFss()
  const tempRef = useRef(null)
  const servoRef = useRef(null)
  const [copied, setCopied] = useState(false)

  // Vẽ lại biểu đồ mỗi khi lịch sử thay đổi
  useEffect(() => {
    const tctx = tempRef.current?.getContext('2d')
    if (tctx) drawLine(tctx, state.tempHistory, '#ff5d5d', 20, 150)

    const sctx = servoRef.current?.getContext('2d')
    if (sctx) {
      const w = sctx.canvas.offsetWidth || sctx.canvas.width
      const h = sctx.canvas.offsetHeight || sctx.canvas.height
      if (state.panHistory.length) {
        drawLine(sctx, state.panHistory, '#3b82f6', 0, 180)
        const pts = state.tiltHistory.slice(-60)
        const step = w / (pts.length - 1 || 1)
        sctx.beginPath()
        pts.forEach((v, i) => {
          const x = i * step
          const y = h - (v / 90) * (h - 4) - 2
          i === 0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y)
        })
        sctx.strokeStyle = '#e5a000'
        sctx.lineWidth = 1.5
        sctx.stroke()
      }
    }
  }, [state.tempHistory, state.panHistory, state.tiltHistory])

  const resp = avgResponse(state.totalResponses)

  // Response-time block
  let rt
  if (state.alertLevel > 0) {
    const sup = derived.elapsedSec * 1000
    rt = {
      det: fmtMs(state.rtDetection), srv: fmtMs(state.rtServoTrack), pmp: fmtMs(state.rtPumpActivation), sup: fmtMs(sup),
      detP: Math.min(100, (state.rtDetection / 500) * 100), srvP: Math.min(100, (state.rtServoTrack / 3000) * 100),
      pmpP: Math.min(100, (state.rtPumpActivation / 4000) * 100), supP: Math.min(100, (sup / 15000) * 100),
    }
  } else if (state.incidents.length > 0) {
    const l = state.incidents[0]
    rt = {
      det: fmtMs(l.rtDetection), srv: fmtMs(l.rtServoTrack), pmp: fmtMs(l.rtPumpActivation), sup: fmtMs(l.responseTime),
      detP: Math.min(100, (l.rtDetection / 500) * 100), srvP: Math.min(100, (l.rtServoTrack / 3000) * 100),
      pmpP: Math.min(100, (l.rtPumpActivation / 4000) * 100), supP: Math.min(100, (l.responseTime / 15000) * 100),
    }
  } else {
    rt = { det: '—', srv: '—', pmp: '—', sup: '—', detP: 0, srvP: 0, pmpP: 0, supP: 0 }
  }

  const handleCopy = () => {
    copyDataJSON(state)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="tab-pane active" id="pane-analytics">
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
        <span style={{ fontSize: '8px', color: 'var(--text3)', fontFamily: "'DM Mono',monospace", letterSpacing: '0.5px', flex: 1 }}>SESSION DATA</span>
        <button className="inc-export-btn" onClick={() => exportDataCSV(state, derived.uptimeSec)} title="Export all data CSV">⬇ CSV</button>
        <button className="inc-export-btn" onClick={handleCopy} title="Copy JSON snapshot">{copied ? '✓ Copied' : '{} JSON'}</button>
      </div>

      <div className="analytics-section">
        <div className="an-title">Today's Statistics</div>
        <div className="stat-2col">
          <div className="stat-cell"><div className="stat-cell-label">Fire Events</div><div className="stat-cell-val">{state.eventsToday}</div></div>
          <div className="stat-cell"><div className="stat-cell-label">Avg Response</div><div className="stat-cell-val">{resp.val}</div></div>
          <div className="stat-cell"><div className="stat-cell-label">Sensors Active</div><div className="stat-cell-val">7/7</div></div>
          <div className="stat-cell"><div className="stat-cell-label">Uptime</div><div className="stat-cell-val">{fmtUptime(derived.uptimeSec)}</div></div>
        </div>
      </div>

      <div className="analytics-section">
        <div className="an-title">Temperature Trend</div>
        <canvas className="mini-chart" ref={tempRef}></canvas>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--text3)', fontFamily: "'DM Mono',monospace", marginTop: '2px' }}>
          <span>— 60s ago</span><span>Now: {state.temp.toFixed(1)}°C</span>
        </div>
      </div>

      <div className="analytics-section">
        <div className="an-title">Servo Position</div>
        <canvas className="mini-chart" ref={servoRef}></canvas>
        <div style={{ display: 'flex', gap: '10px', marginTop: '3px' }}>
          <span style={{ fontSize: '8px', color: 'var(--accent)', fontFamily: "'DM Mono',monospace" }}>■ Pan</span>
          <span style={{ fontSize: '8px', color: 'var(--warn)', fontFamily: "'DM Mono',monospace" }}>■ Tilt</span>
        </div>
      </div>

      <div className="analytics-section">
        <div className="an-title">Response Times</div>
        <div className="rt-grid">
          <RT label="Detection" value={rt.det} pct={rt.detP} />
          <RT label="Servo Track" value={rt.srv} pct={rt.srvP} variant="w" />
          <RT label="Pump Activ." value={rt.pmp} pct={rt.pmpP} variant="d" />
          <RT label="Suppression" value={rt.sup} pct={rt.supP} />
        </div>
      </div>
    </div>
  )
}
