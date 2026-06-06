/**
 * CTA — khối kêu gọi hành động trước footer.
 */
export default function CTA({ onLogin, onSignup }) {
  return (
    <section className="cta-section" id="contact">
      <div className="cta-bg-pattern"></div>
      <div className="cta-glow"></div>
      <div className="cta-inner">
        <h2 className="cta-title fade-up">Sẵn sàng triển khai<br /><em>hệ thống của bạn?</em></h2>
        <p className="cta-desc fade-up delay-1">
          Đăng ký ngay để truy cập dashboard điều khiển và bắt đầu kết nối thiết bị ESP32 của bạn với nền tảng FSS·CTRL.
        </p>
        <div className="cta-btns fade-up delay-2">
          <button type="button" className="cta-btn-main" onClick={onSignup}>🚀 Tạo tài khoản miễn phí</button>
          <button type="button" className="cta-btn-outline" onClick={onLogin}>Đăng nhập</button>
        </div>
      </div>
    </section>
  )
}
