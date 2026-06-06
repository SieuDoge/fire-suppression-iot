/**
 * Navbar — thanh điều hướng cố định trên cùng của Landing Page.
 * @param {() => void} onLogin  mở modal đăng nhập
 * @param {() => void} onSignup mở modal đăng ký
 */
export default function Navbar({ onLogin, onSignup }) {
  return (
    <nav>
      <a href="#home" className="nav-logo">
        <div className="nav-logo-icon">🔥</div>
        <div>
          <div className="nav-logo-text">FSS·CTRL</div>
          <div className="nav-logo-sub">Fire Suppression System</div>
        </div>
      </a>

      <div className="nav-links">
        <a href="#features" className="nav-link">Tính năng</a>
        <a href="#how" className="nav-link">Cách hoạt động</a>
        <a href="#specs" className="nav-link">Thông số</a>
        <a href="#contact" className="nav-link">Liên hệ</a>
      </div>

      <div className="nav-actions">
        <button type="button" className="btn-login" onClick={onLogin}>Đăng nhập</button>
        <button type="button" className="btn-signup" onClick={onSignup}>Đăng ký</button>
      </div>
    </nav>
  )
}
