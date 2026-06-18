import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem('ignis_user'))
  const [token, setToken] = useState(() => localStorage.getItem('ignis_token'))
  const [role, setRole] = useState(() => localStorage.getItem('ignis_role'))

  const isAuthenticated = !!token
  const isAdmin = role === 'admin' || role === 'ADMIN'

  const login = useCallback(async (username, password) => {
    const res = await apiLogin(username, password)
    // res = { success, message, data: { token, username, role } }
    if (res.success && res.data) {
      const { token: jwt, username: uname, role: urole } = res.data
      localStorage.setItem('ignis_token', jwt)
      localStorage.setItem('ignis_user', uname)
      localStorage.setItem('ignis_role', urole)
      setToken(jwt)
      setUser(uname)
      setRole(urole)
      return { success: true }
    }
    return { success: false, message: res.message || 'Login failed' }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ignis_token')
    localStorage.removeItem('ignis_user')
    localStorage.removeItem('ignis_role')
    setToken(null)
    setUser(null)
    setRole(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
