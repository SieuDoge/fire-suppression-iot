const HARDWARE = [
  ['Vi điều khiển', 'ESP32 240MHz'],
  ['Cảm biến nhiệt', 'MLX90614'],
  ['Servo Pan', '0° – 180°'],
  ['Servo Tilt', '0° – 90°'],
  ['Bể nước', '200 Lít'],
  ['Lưu lượng tối đa', '2.5 L/min'],
]

const SOFTWARE = [
  ['Giao thức IoT', 'MQTT v5'],
  ['REST API', 'HTTP/JSON'],
  ['Chu kỳ polling', '500ms'],
  ['Thời gian phản ứng', '< 100ms'],
  ['Giao diện', 'Web Dashboard'],
  ['Vùng giám sát', '4 zones'],
]

function SpecBlock({ icon, title, rows, delay }) {
  return (
    <div className={`spec-block fade-up delay-${delay}`}>
      <div className="spec-block-hdr">
        <span className="spec-block-icon">{icon}</span>
        <span className="spec-block-title">{title}</span>
      </div>
      <div className="spec-rows">
        {rows.map(([k, v]) => (
          <div className="spec-row" key={k}>
            <span className="spec-key">{k}</span>
            <span className="spec-val">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Specs() {
  return (
    <section className="specs-section" id="specs">
      <div className="section-label fade-up">Thông số kỹ thuật</div>
      <h2 className="section-title fade-up delay-1">Chi tiết hệ thống</h2>
      <p className="section-sub fade-up delay-2">
        Được xây dựng trên nền tảng phần cứng công nghiệp với firmware tùy chỉnh.
      </p>

      <div className="specs-grid">
        <SpecBlock icon="🖥️" title="Phần cứng" rows={HARDWARE} delay={1} />
        <SpecBlock icon="⚙️" title="Phần mềm & Kết nối" rows={SOFTWARE} delay={2} />
      </div>
    </section>
  )
}
