const STEPS = [
  { num: '01', title: 'Phát hiện nhiệt', desc: 'Cảm biến MLX90614 quét liên tục, phát hiện điểm nhiệt bất thường vượt ngưỡng cài đặt trong <100ms.' },
  { num: '02', title: 'Cảnh báo & phân tích', desc: 'Hệ thống kích hoạt banner cảnh báo, xác định vùng bị ảnh hưởng, tính toán tọa độ nguồn nhiệt.' },
  { num: '03', title: 'Định hướng servo', desc: 'Servo pan/tilt tự động xoay để chính xác định hướng vòi phun vào điểm cháy đã được xác định.' },
  { num: '04', title: 'Kích hoạt bơm', desc: 'Bơm nước tự động bật theo áp suất phù hợp, duy trì cho đến khi nhiệt độ về mức an toàn.' },
]

export default function HowItWorks() {
  return (
    <div className="how-section" id="how">
      <div className="how-inner">
        <div className="section-label fade-up">Quy trình</div>
        <h2 className="section-title fade-up delay-1">Hoạt động như thế nào?</h2>
        <p className="section-sub fade-up delay-2">Quy trình 4 bước từ phát hiện đến dập tắt hoàn toàn tự động.</p>

        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div className={`step fade-up delay-${i + 1}`} key={s.num}>
              <div className="step-num">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
