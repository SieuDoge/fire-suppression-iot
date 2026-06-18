import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getUsers,
  deleteUser,
  updateUserRole,
  register,
  getFireEvents,
  deleteFireEvent,
  deleteAllFireEvents,
} from '../../services/api'
import '../../styles/admin.css'

export default function AdminPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [activeTab, setActiveTab] = useState('users')

  // ── Users state ──
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // ── Fire events state ──
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  // ── UI state ──
  const [confirm, setConfirm] = useState(null) // { action, title, text }
  const [toast, setToast] = useState(null) // { type: 'success'|'error', text }

  const showToast = useCallback((type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // ── Load data ──
  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const res = await getUsers()
      const data = res?.data || res
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      showToast('error', 'Failed to load users')
    }
    setUsersLoading(false)
  }, [showToast])

  const loadEvents = useCallback(async () => {
    setEventsLoading(true)
    try {
      const res = await getFireEvents()
      const data = res?.data || res
      setEvents(Array.isArray(data) ? data : [])
    } catch (err) {
      showToast('error', 'Failed to load fire events')
    }
    setEventsLoading(false)
  }, [showToast])

  useEffect(() => {
    loadUsers()
    loadEvents()
  }, [loadUsers, loadEvents])

  // ── User actions ──
  const handleAddUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      showToast('error', 'Username and password required')
      return
    }
    try {
      const res = await register(newUsername.trim(), newPassword.trim())
      if (res.success) {
        showToast('success', `User "${newUsername}" created`)
        setNewUsername('')
        setNewPassword('')
        loadUsers()
      } else {
        showToast('error', res.message || 'Failed to create user')
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to create user')
    }
  }

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id)
      showToast('success', 'User deleted')
      loadUsers()
    } catch (err) {
      showToast('error', 'Failed to delete user')
    }
    setConfirm(null)
  }

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole)
      showToast('success', 'Role updated')
      loadUsers()
    } catch (err) {
      showToast('error', 'Failed to update role')
    }
  }

  // ── Fire event actions ──
  const handleDeleteEvent = async (id) => {
    try {
      await deleteFireEvent(id)
      showToast('success', 'Event deleted')
      loadEvents()
    } catch (err) {
      showToast('error', 'Failed to delete event')
    }
    setConfirm(null)
  }

  const handleDeleteAllEvents = async () => {
    try {
      await deleteAllFireEvents()
      showToast('success', 'All events deleted')
      loadEvents()
    } catch (err) {
      showToast('error', 'Failed to delete events')
    }
    setConfirm(null)
  }

  const fmtDate = (str) => {
    if (!str) return '—'
    try {
      return new Date(str).toLocaleString()
    } catch {
      return str
    }
  }

  return (
    <div className="admin-page">
      {/* Top bar */}
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-topbar-logo">🔥 FSS·<span>ADMIN</span></div>
        </div>
        <button className="admin-back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        <div className="admin-title">
          <div className="admin-title-icon">⚙</div>
          Admin Panel
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab${activeTab === 'users' ? ' active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👤 Users
          </button>
          <button
            className={`admin-tab${activeTab === 'events' ? ' active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            🔥 Fire Events
          </button>
        </div>

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">
                <span>👤</span> User Management
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                {users.length} user{users.length !== 1 ? 's' : ''}
              </span>
            </div>

            {usersLoading ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">⏳</div>
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">👤</div>
                No users found
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--text3)' }}>
                        #{u.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.username}</td>
                      <td>
                        <select
                          className="admin-role-select"
                          value={(u.role || 'VIEWER').toUpperCase()}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="VIEWER">VIEWER</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text2)' }}>
                        {fmtDate(u.createdAt)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="admin-btn danger"
                          onClick={() => setConfirm({
                            title: 'Delete User',
                            text: `Delete user "${u.username}"? This cannot be undone.`,
                            action: () => handleDeleteUser(u.id),
                          })}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Add user form */}
            <div className="admin-add-form">
              <input
                className="admin-input"
                type="text"
                placeholder="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
              />
              <input
                className="admin-input"
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
              />
              <button className="admin-btn primary" onClick={handleAddUser}>
                + Add User
              </button>
            </div>
          </div>
        )}

        {/* ── Fire Events Tab ── */}
        {activeTab === 'events' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">
                <span>🔥</span> Fire Events
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </span>
                {events.length > 0 && (
                  <button
                    className="admin-btn warn"
                    onClick={() => setConfirm({
                      title: 'Delete All Events',
                      text: 'Delete ALL fire events? This cannot be undone.',
                      action: handleDeleteAllEvents,
                    })}
                  >
                    🗑 Delete All
                  </button>
                )}
              </div>
            </div>

            {eventsLoading ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">⏳</div>
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">🔥</div>
                No fire events recorded
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Detected At</th>
                    <th>Extinguished At</th>
                    <th>Max Temp</th>
                    <th>Duration</th>
                    <th>Sensors</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => (
                    <tr key={evt.id}>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--text3)' }}>
                        #{evt.id}
                      </td>
                      <td style={{ fontSize: '12px' }}>{fmtDate(evt.detectedAt)}</td>
                      <td style={{ fontSize: '12px' }}>{fmtDate(evt.extinguishedAt)}</td>
                      <td>
                        <span style={{
                          fontFamily: "'DM Mono', monospace",
                          fontWeight: 700,
                          color: (evt.maxTemp ?? 0) >= 100 ? 'var(--danger)' : (evt.maxTemp ?? 0) >= 60 ? 'var(--warn)' : 'var(--text)',
                        }}>
                          {evt.maxTemp?.toFixed(1) ?? '—'}°C
                        </span>
                      </td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>
                        {evt.duration ? `${evt.duration}s` : '—'}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {evt.triggeredSensors || '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="admin-btn danger"
                          onClick={() => setConfirm({
                            title: 'Delete Event',
                            text: `Delete fire event #${evt.id}?`,
                            action: () => handleDeleteEvent(evt.id),
                          })}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {confirm && (
        <div className="admin-confirm-overlay" onClick={() => setConfirm(null)}>
          <div className="admin-confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-title">{confirm.title}</div>
            <div className="admin-confirm-text">{confirm.text}</div>
            <div className="admin-confirm-actions">
              <button className="admin-btn" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="admin-btn danger" onClick={confirm.action}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.text}
        </div>
      )}
    </div>
  )
}
