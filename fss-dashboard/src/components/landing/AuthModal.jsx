import { useEffect, useState } from 'react'

/**
 * AuthModal — modal Đăng nhập / Đăng ký.
 * @param {'login'|'signup'|null} type  loại modal đang mở (null = đóng)
 * @param {() => void} onClose          đóng modal
 * @param {(to:'login'|'signup') => void} onSwitch  chuyển qua lại login/signup
 * @param {() => void} onSubmit         xử lý sau khi đăng nhập/đăng ký (điều hướng)
 */
export default function AuthModal({ type, onClose, onSwitch, onSubmit }) {
  const [submitting, setSubmitting] = useState(false)

  // Đóng modal bằng phím ESC + khóa cuộn nền
  useEffect(() => {
    if (!type) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [type, onClose])

  // Reset trạng thái khi đổi loại modal
  useEffect(() => setSubmitting(false), [type])

  if (!type) return null

  const isLogin = type === 'login'

  const handleSubmit = () => {
    setSubmitting(true)
    // Giả lập gọi xác thực rồi điều hướng sang Dashboard
    setTimeout(() => onSubmit(), 700)
  }

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo">
          <div className="modal-logo-icon">🔥</div>
          <div className="modal-logo-text">FSS·CTRL</div>
        </div>

        <h2 className="modal-title">{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
        <p className="modal-sub">
          {isLogin ? 'Truy cập hệ thống điều khiển của bạn' : 'Bắt đầu giám sát hệ thống trong vài phút'}
        </p>

        {!isLogin && (
          <div className="field">
            <div className="field-label">Họ &amp; Tên</div>
            <input className="field-input" type="text" placeholder="Nguyễn Văn A" />
          </div>
        )}

        <div className="field">
          <div className="field-label">Email</div>
          <input className="field-input" type="email" placeholder={isLogin ? 'admin@fss.local' : 'you@example.com'} />
        </div>

        <div className="field">
          <div className="field-label">Mật khẩu</div>
          <input className="field-input" type="password" placeholder={isLogin ? '••••••••' : 'Tối thiểu 8 ký tự'} />
        </div>

        <button className="modal-submit" onClick={handleSubmit} disabled={submitting}>
          {submitting
            ? isLogin ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...'
            : isLogin ? 'Đăng nhập →' : 'Tạo tài khoản →'}
        </button>

        <div className="modal-footer">
          {isLogin ? (
            <>Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); onSwitch('signup') }}>Đăng ký ngay</a></>
          ) : (
            <>Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); onSwitch('login') }}>Đăng nhập</a></>
          )}
        </div>
      </div>
    </div>
  )
}
