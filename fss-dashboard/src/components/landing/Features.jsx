const FEATURES = [
  { icon: '🌡️', color: 'red', title: 'Cảm biến IR MLX90614', desc: 'Đo nhiệt độ từ xa chính xác ±0.5°C, phát hiện điểm nhiệt bất thường ngay lập tức, cập nhật mỗi 500ms.', delay: 1 },
  { icon: '🎯', color: 'blue', title: 'Servo định hướng 2 trục', desc: 'Pan 0–180° và Tilt 0–90°, tự động theo dõi nguồn nhiệt và định hướng vòi phun chính xác đến từng độ.', delay: 2 },
  { icon: '💧', color: 'green', title: 'Điều khiển bơm thông minh', desc: '3 mức áp suất (LOW/MEDIUM/HIGH), điều chỉnh lưu lượng 0–100%, theo dõi mức nước bể theo thời gian thực.', delay: 3 },
  { icon: '⚡', color: 'orange', title: 'Phản ứng tự động', desc: 'Chế độ AUTO tự kích hoạt bơm và điều chỉnh servo ngay khi phát hiện nhiệt độ vượt ngưỡng, không cần can thiệp.', delay: 1 },
  { icon: '📊', color: 'purple', title: 'Dashboard thời gian thực', desc: 'Bản đồ vùng giám sát, biểu đồ nhiệt độ và lưu lượng nước, lịch sử sự kiện và phân tích thời gian phản ứng.', delay: 2 },
  { icon: '🔗', color: 'slate', title: 'ESP32 + MQTT', desc: 'Kết nối ESP32 qua MQTT broker, REST API đầy đủ (GET/POST), hỗ trợ tích hợp với hệ thống BMS/SCADA hiện có.', delay: 3 },
]

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="section-label fade-up">Tính năng</div>
      <h2 className="section-title fade-up delay-1">Toàn bộ những gì bạn cần<br />để kiểm soát hỏa hoạn</h2>
      <p className="section-sub fade-up delay-2">
        Từ phát hiện đến dập tắt, FSS·CTRL xử lý toàn bộ quy trình với độ chính xác cao và giao diện trực quan.
      </p>

      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div className={`feature-card fade-up delay-${f.delay}`} key={i}>
            <div className={`feature-icon ${f.color}`}>{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
