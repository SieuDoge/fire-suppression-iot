import { useState, useEffect, useRef } from 'react'

/**
 * useElementSize — theo dõi kích thước (offsetWidth/offsetHeight) của một
 * phần tử qua ResizeObserver. Dùng để tính toạ độ cảm biến trên cung tròn.
 * @returns {[React.RefObject, {w:number,h:number}]}
 */
export default function useElementSize() {
  const ref = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, size]
}
