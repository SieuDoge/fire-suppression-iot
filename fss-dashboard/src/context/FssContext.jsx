import { createContext, useContext } from 'react'
import useFssSystem from '../hooks/useFssSystem'

/* ============================================================
   FssContext — chia sẻ state & actions của hệ thống cho toàn
   bộ cây component của Dashboard, tránh truyền props lồng nhau.
   ============================================================ */
const FssContext = createContext(null)

export function FssProvider({ children }) {
  const fss = useFssSystem()
  return <FssContext.Provider value={fss}>{children}</FssContext.Provider>
}

// Hook tiện dụng để lấy { state, derived, actions }
export function useFss() {
  const ctx = useContext(FssContext)
  if (!ctx) throw new Error('useFss phải được dùng bên trong <FssProvider>')
  return ctx
}

export default FssContext
