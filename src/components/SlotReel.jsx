import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

const ITEM_W = 168          // bề rộng mỗi ô trên cuộn (px)
const TARGET_INDEX = 3      // vị trí ô trúng trong cuộn (có vài ô bên trái làm nền)
const SPIN_DURATION = 6     // giây

/** Tiếng "tích" kiểu bánh xe casino, dùng WebAudio nên không cần file âm thanh */
function makeTicker() {
  let ctx = null
  return (fast) => {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
      if (ctx.state === 'suspended') ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = fast ? 1400 : 900
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch { /* trình duyệt chặn audio thì thôi */ }
  }
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Tạo dãy dài từ danh sách, tránh 2 ô liền nhau trùng tên khi có thể */
function buildStrip(items, length) {
  const out = []
  while (out.length < length) {
    for (const it of shuffle(items)) {
      if (out.length && items.length > 1 && out[out.length - 1].id === it.id) continue
      out.push(it)
      if (out.length >= length) break
    }
  }
  return out
}

const itemsKeyOf = (items) => items.map(i => i.id).join('|')

/**
 * Cuộn quay số kiểu casino: dải tên chạy từ trái sang phải, giảm tốc dần, khựng lại đúng ô trúng.
 * Dùng: const ref = useRef(); <SlotReel ref={ref} items={...} onLanded={...} />; ref.current.spin(pick)
 */
export default function SlotReel({ ref, items, onLanded, muted = false }) {
  const containerRef = useRef(null)
  const tickRef = useRef(null)
  const controlsRef = useRef(null)
  const x = useMotionValue(0)

  const [width, setWidth] = useState(0)
  const [reel, setReel] = useState(null)          // { key, list }
  const [centerIdx, setCenterIdx] = useState(TARGET_INDEX)
  const [landedIdx, setLandedIdx] = useState(null)
  const [spinning, setSpinning] = useState(false)

  const itemsKey = itemsKeyOf(items)
  const centerOffset = width / 2 - ITEM_W / 2

  // Khi chưa quay (hoặc bộ lọc đã đổi) thì hiện dải tĩnh từ danh sách hiện tại
  const active = reel && reel.key === itemsKey ? reel.list : null
  const idleList = items.length ? buildStrip(items, Math.max(items.length, 8)) : []
  const list = active || idleList
  const showLanded = active ? landedIdx : null
  const highlightIdx = active ? centerIdx : 1

  // Đo bề rộng khung để canh giữa
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Lúc nghỉ: đặt cuộn đứng yên ở ô số 1
  useEffect(() => {
    if (!active && !spinning) x.set(centerOffset - 1 * ITEM_W)
  }, [active, spinning, centerOffset, x])

  useImperativeHandle(ref, () => ({
    spin(pick) {
      if (!items.length || !containerRef.current) return
      controlsRef.current?.stop()
      const cw = containerRef.current.offsetWidth
      const offset = cw / 2 - ITEM_W / 2
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

      // Dải: [3 ô nền] [ô trúng] [~30 ô chạy qua]
      const lead = buildStrip(items, TARGET_INDEX)
      const tail = buildStrip(items, reduce ? 6 : Math.max(26, items.length * 3))
      const strip = [...lead, pick, ...tail]
      const startIdx = strip.length - 3
      const xStart = offset - startIdx * ITEM_W
      const xEnd = offset - TARGET_INDEX * ITEM_W

      setReel({ key: itemsKey, list: strip })
      setLandedIdx(null)
      setCenterIdx(startIdx)
      setSpinning(true)
      x.set(xStart)

      if (!muted) tickRef.current = tickRef.current || makeTicker()
      let last = startIdx
      let startedAt = performance.now()

      // Pha 1: lao nhanh rồi hãm dần, vượt quá đích một chút
      controlsRef.current = animate(x, xEnd + ITEM_W * 0.28, {
        duration: reduce ? 0.6 : SPIN_DURATION,
        ease: [0.12, 0.9, 0.18, 1],
        onUpdate: (v) => {
          const idx = Math.round((offset - v) / ITEM_W)
          if (idx !== last) {
            last = idx
            setCenterIdx(idx)
            if (!muted) tickRef.current?.(performance.now() - startedAt < SPIN_DURATION * 400)
          }
        },
        onComplete: () => {
          // Pha 2: nảy ngược về đúng ô trúng (cú khựng cuối)
          controlsRef.current = animate(x, xEnd, {
            type: 'spring', stiffness: 260, damping: 14,
            onComplete: () => {
              setCenterIdx(TARGET_INDEX)
              setLandedIdx(TARGET_INDEX)
              setSpinning(false)
              onLanded?.(pick)
            },
          })
        },
      })
    },
    stop() { controlsRef.current?.stop() },
  }), [items, itemsKey, muted, onLanded, x])

  return (
    <div className="relative select-none">
      {/* Kim chỉ */}
      <motion.div
        key={highlightIdx}
        initial={{ scale: 1.35, y: -2 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.18 }}
        className="absolute left-1/2 -translate-x-1/2 -top-1 z-20 text-sky-600 text-sm leading-none drop-shadow"
      >▼</motion.div>

      <div
        ref={containerRef}
        className="relative h-[4.5rem] overflow-hidden rounded-2xl bg-white/80 border border-sky-200"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 18%, black 82%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 18%, black 82%, transparent)',
        }}
      >
        {/* Ô cửa sổ giữa */}
        <div
          className={`absolute top-1.5 bottom-1.5 left-1/2 -translate-x-1/2 rounded-xl border-2 transition-colors z-10 pointer-events-none ${showLanded != null ? 'border-sky-500 bg-sky-100/60 shadow-[0_0_24px_rgba(14,165,233,0.35)]' : 'border-sky-300/70 bg-sky-50/50'}`}
          style={{ width: ITEM_W - 8 }}
        />

        {/* Dải tên */}
        <motion.div style={{ x }} className="absolute inset-y-0 left-0 flex will-change-transform">
          {list.map((p, i) => {
            const isCenter = i === highlightIdx
            const isLanded = i === showLanded
            return (
              <div key={`${p.id}-${i}`} style={{ width: ITEM_W }} className="shrink-0 h-full flex items-center justify-center px-3">
                <span
                  className={`block max-w-full truncate font-black transition-all duration-150 ${
                    isLanded ? 'text-sky-700 text-lg scale-110'
                    : isCenter ? 'text-sky-600 text-base scale-105'
                    : 'text-sky-300 text-sm'
                  }`}
                >
                  {p.name}
                </span>
              </div>
            )
          })}
          {list.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400" style={{ width: 400 }}>
              Chưa có quán nào để quay
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
