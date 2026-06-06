import { useFss } from '../../../context/FssContext'

/**
 * ManualPane — điều khiển servo thủ công (chỉ hoạt động ở MANUAL MODE):
 * thanh trượt + ô số + nút bước (nudge) cho Pan/Tilt, và Track/Center/Home.
 */
export default function ManualPane() {
  const { state, actions } = useFss()
  const auto = state.isAutoMode

  return (
    <div className="tab-pane active" id="pane-manual">
      <div className="mc-section" style={{ paddingBottom: 0, borderBottom: 'none' }}>
        <div className={`manual-locked-notice${auto ? '' : ' warn'}`}>
          {auto ? 'AUTO MODE — Controls locked' : 'MANUAL MODE — Controls active'}
        </div>
      </div>

      <div className="mc-section">
        <div className="mc-title">Servo / Pan-Tilt</div>

        {/* PAN */}
        <div className="sv-axis-wrap">
          <div className="sv-axis-label">
            PAN ANGLE
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="number" min={0} max={180} value={state.pan} disabled={auto}
                style={{ width: '52px', fontFamily: "'DM Mono',monospace", fontSize: '11px', fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--border)', background: 'var(--surface2)', borderRadius: '4px', padding: '2px 5px', textAlign: 'center' }}
                onChange={(e) => actions.updateServo('pan', e.target.value)}
              />
              <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: "'DM Mono',monospace" }}>/ 180°</span>
            </div>
          </div>
          <div className="sv-slider-row">
            <button className="sv-arrow-btn" onClick={() => actions.nudgeServo('pan', -5)} disabled={auto} title="-5°">◀</button>
            <input
              className="sv-slider" type="range" min={0} max={180} value={state.pan} disabled={auto}
              style={{ '--val': (state.pan / 180) * 100 + '%' }}
              onChange={(e) => actions.updateServo('pan', e.target.value)}
            />
            <button className="sv-arrow-btn" onClick={() => actions.nudgeServo('pan', 5)} disabled={auto} title="+5°">▶</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--text3)', fontFamily: "'DM Mono',monospace", marginTop: '2px', padding: '0 28px' }}>
            <span>0°</span><span>45°</span><span>90°</span><span>135°</span><span>180°</span>
          </div>
        </div>

        {/* TILT */}
        <div className="sv-axis-wrap" style={{ marginTop: '10px' }}>
          <div className="sv-axis-label">
            TILT ANGLE
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="number" min={0} max={90} value={state.tilt} disabled={auto}
                style={{ width: '52px', fontFamily: "'DM Mono',monospace", fontSize: '11px', fontWeight: 600, color: 'var(--warn)', border: '1px solid var(--border)', background: 'var(--surface2)', borderRadius: '4px', padding: '2px 5px', textAlign: 'center' }}
                onChange={(e) => actions.updateServo('tilt', e.target.value)}
              />
              <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: "'DM Mono',monospace" }}>/ 90°</span>
            </div>
          </div>
          <div className="sv-slider-row">
            <button className="sv-arrow-btn" onClick={() => actions.nudgeServo('tilt', -5)} disabled={auto} title="-5°">▼</button>
            <input
              className="sv-slider" type="range" min={0} max={90} value={state.tilt} disabled={auto}
              style={{ '--val': (state.tilt / 90) * 100 + '%' }}
              onChange={(e) => actions.updateServo('tilt', e.target.value)}
            />
            <button className="sv-arrow-btn" onClick={() => actions.nudgeServo('tilt', 5)} disabled={auto} title="+5°">▲</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--text3)', fontFamily: "'DM Mono',monospace", marginTop: '2px', padding: '0 28px' }}>
            <span>0°</span><span>22°</span><span>45°</span><span>67°</span><span>90°</span>
          </div>
        </div>

        <div className="servo-track-btns" style={{ marginTop: '8px' }}>
          <button className="str-btn track" onClick={actions.trackTarget} disabled={auto}>TRACK</button>
          <button className="str-btn center" onClick={actions.centerServo} disabled={auto}>CENTER</button>
          <button className="str-btn reset" onClick={actions.resetServo} disabled={auto}>HOME</button>
        </div>
      </div>
    </div>
  )
}
