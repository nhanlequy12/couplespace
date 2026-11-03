import { useRef } from 'react'

/** Cho phép kéo chuột để cuộn ngang (trên desktop). Trên mobile đã có cuộn ngón tay sẵn. */
export function useDragScroll() {
  const ref = useRef(null)

  const onMouseDown = (e) => {
    const ele = ref.current
    if (!ele || e.button !== 0) return
    const start = { left: ele.scrollLeft, x: e.clientX }
    let moved = false

    const onMove = (ev) => {
      const dx = ev.clientX - start.x
      if (Math.abs(dx) > 4) moved = true
      ele.scrollLeft = start.left - dx
    }
    const onUp = (ev) => {
      ele.classList.remove('cursor-grabbing', 'select-none')
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      // Chặn click nhầm sau khi kéo
      if (moved) {
        const stop = (ce) => { ce.stopPropagation(); ce.preventDefault() }
        ele.addEventListener('click', stop, { capture: true, once: true })
        setTimeout(() => ele.removeEventListener('click', stop, { capture: true }), 0)
      }
      void ev
    }

    ele.classList.add('cursor-grabbing', 'select-none')
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return { ref, onMouseDown }
}
