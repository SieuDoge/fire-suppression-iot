import { useState, useEffect } from 'react'
import { fmtUptime } from '../../data/constants'

/**
 * Hero — phần đầu trang gồm tiêu đề, CTA và bản xem trước dashboard.
 * @param {() => void} onSignup mở modal đăng ký (nút "Bắt đầu ngay")
 */
export default function Hero({ onSignup }) {
  const [start] = useState(Date.now())
  const [uptime, setUptime] = useState('00:00:00')

  // Đồng hồ uptime cho bản preview
  useEffect(() => {
    const id = setInterval(() => {
      setUptime(fmtUptime(Math.floor((Date.now() - start) / 1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [start])

  return (
    <section className="hero" id="home">
      <div className="hero-bg"></div>
      <div className="hero-grid"></div>
      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-badge fade-up visible">
            <div className="hero-badge-dot"></div>
            <span className="hero-badge-text">Hệ thống đang hoạt động</span>
          </div>
          <h1 className="hero-title fade-up visible delay-1">
            Kiểm soát<br /><em>chữa cháy</em><br />thông minh
          </h1>
          <p className="hero-desc fade-up visible delay-2">
            FSS·CTRL là nền tảng giám sát và điều khiển hệ thống chữa cháy tự động sử dụng cảm biến IR,
            servo định hướng và bơm nước tích hợp — phản ứng trong mili giây.
          </p>
          <div className="hero-cta fade-up visible delay-3">
            <button type="button" className="cta-primary" onClick={onSignup}>🚀 Bắt đầu ngay</button>
            <a href="#features" className="cta-secondary">Xem tính năng →</a>
          </div>
          <div className="hero-stats fade-up visible delay-4">
            <div>
              <div className="h-stat-val">&lt; 100ms</div>
              <div className="h-stat-label">Thời gian phản ứng</div>
            </div>
            <div className="h-stat-divider"></div>
            <div>
              <div className="h-stat-val">4 zones</div>
              <div className="h-stat-label">Vùng giám sát</div>
            </div>
            <div className="h-stat-divider"></div>
            <div>
              <div className="h-stat-val">24/7</div>
              <div className="h-stat-label">Giám sát liên tục</div>
            </div>
          </div>
        </div>

        {/* Bản xem trước dashboard thu nhỏ */}
        <div className="hero-right fade-up visible delay-2">
          <div className="dashboard-preview">
            <div className="dp-titlebar">
              <div className="dp-dot"></div>
              <div className="dp-dot"></div>
              <div className="dp-dot"></div>
              <div className="dp-url">fss-ctrl.local/dashboard</div>
            </div>
            <div className="dp-header">
              <div className="dp-logo">🔥</div>
              <div className="dp-logo-txt">FSS·CTRL v5</div>
              <div className="dp-kpis">
                <div className="dp-kpi ok">
                  <div className="dp-kpi-label">TEMP</div>
                  <div className="dp-kpi-val">28.5°C</div>
                </div>
                <div className="dp-kpi info">
                  <div className="dp-kpi-label">TANK</div>
                  <div className="dp-kpi-val">200L</div>
                </div>
                <div className="dp-kpi ok">
                  <div className="dp-kpi-label">STATUS</div>
                  <div className="dp-kpi-val">NORM</div>
                </div>
              </div>
            </div>
            <div className="dp-body">
              <div className="dp-map">
                <div className="dp-sensor n"><span className="dp-s-lbl">NORTH</span><span className="dp-s-val">OK</span></div>
                <div className="dp-sensor s"><span className="dp-s-lbl">SOUTH</span><span className="dp-s-val">OK</span></div>
                <div className="dp-sensor e"><span className="dp-s-lbl">EAST</span><span className="dp-s-val">OK</span></div>
                <div className="dp-sensor w"><span className="dp-s-lbl">WEST</span><span className="dp-s-val">OK</span></div>
                <div className="dp-crosshair">
                  <div className="dp-ch-h"></div>
                  <div className="dp-ch-v"></div>
                  <div className="dp-ch-dot"></div>
                </div>
              </div>
              <div className="dp-sidebar">
                <div className="dp-sb-item">
                  <div className="dp-sb-lbl">PUMP</div>
                  <div className="dp-sb-val">STANDBY</div>
                  <div className="dp-sb-bar"><div className="dp-sb-fill" style={{ width: '0%' }}></div></div>
                </div>
                <div className="dp-sb-item">
                  <div className="dp-sb-lbl">PAN</div>
                  <div className="dp-sb-val">90°</div>
                  <div className="dp-sb-bar"><div className="dp-sb-fill" style={{ width: '50%' }}></div></div>
                </div>
                <div className="dp-sb-item">
                  <div className="dp-sb-lbl">TILT</div>
                  <div className="dp-sb-val">0°</div>
                  <div className="dp-sb-bar"><div className="dp-sb-fill" style={{ width: '5%' }}></div></div>
                </div>
                <div className="dp-sb-item">
                  <div className="dp-sb-lbl">UPTIME</div>
                  <div className="dp-sb-val">{uptime}</div>
                  <div className="dp-sb-bar"><div className="dp-sb-fill" style={{ width: '90%' }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
