import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { register } from '../../services/api'

/**
 * AuthModal — modal Đăng nhập / Đăng ký.
 * @param {'login'|'signup'|null} type  loại modal đang mở (null = đóng)
 * @param {() => void} onClose          đóng modal
 * @param {(to:'login'|'signup') => void} onSwitch  chuyển qua lại login/signup
 * @param {() => void} onSubmit         xử lý sau khi đăng nhập/đăng ký (điều hướng)
 */
export default function AuthModal({ type, onClose, onSwitch, onSubmit }) {
  const auth = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

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
  useEffect(() => {
    setSubmitting(false)
    setError('')
    setUsername('')
    setPassword('')
  }, [type])

  if (!type) return null

  const isLogin = type === 'login'

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      if (isLogin) {
        const result = await auth.login(username, password)
        if (result.success) {
          onSubmit()
        } else {
          setError(result.message || 'Login failed')
          setSubmitting(false)
        }
      } else {
        // Signup
        const res = await register(username, password)
        if (res.success) {
          // Auto-login after registration
          const loginResult = await auth.login(username, password)
          if (loginResult.success) {
            onSubmit()
          } else {
            // Registration succeeded, ask user to login
            setError('')
            onSwitch('login')
          }
        } else {
          setError(res.message || 'Registration failed')
          setSubmitting(false)
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'An error occurred')
      setSubmitting(false)
    }
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

        {error && (
          <div style={{
            background: 'rgba(255,93,93,0.1)',
            border: '1px solid rgba(255,93,93,0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '12px',
            color: '#ff5d5d',
            fontSize: '13px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <div className="field">
          <div className="field-label">{isLogin ? 'Username' : 'Username'}</div>
          <input
            className="field-input"
            type="text"
            placeholder={isLogin ? 'admin' : 'your_username'}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="field">
          <div className="field-label">Mật khẩu</div>
          <input
            className="field-input"
            type="password"
            placeholder={isLogin ? '••••••••' : 'Tối thiểu 8 ký tự'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
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
