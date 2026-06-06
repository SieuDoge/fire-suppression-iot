import { useEffect } from 'react'

/**
 * useScrollReveal — gắn IntersectionObserver vào mọi phần tử có class
 * `.fade-up` bên trong container, thêm class `.visible` khi cuộn tới.
 * Thay thế đoạn IntersectionObserver thủ công trong bản HTML gốc.
 *
 * @param {React.RefObject<HTMLElement>} ref container chứa các phần tử
 */
export default function useScrollReveal(ref) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = root.querySelectorAll('.fade-up')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ref])
}
