/* eslint-disable react-refresh/only-export-components -- file này gom UI + hook useFeedback dùng chung */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/* ---------- Tiện ích class ---------- */
const cx = (...xs) => xs.filter(Boolean).join(' ')

/* ---------- Card ---------- */
export function Card({ className, children, ...rest }) {
  return (
    <div className={cx('card p-4 sm:p-5 min-w-0', className)} {...rest}>
      {children}
    </div>
  )
}

/* ---------- Tiêu đề trang ---------- */
export function PageHeader({ emoji, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5 sm:mb-7">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gradient leading-tight flex items-center gap-2">
          {emoji && <span className="drop-shadow-sm">{emoji}</span>}
          <span className="truncate">{title}</span>
        </h1>
        {subtitle && <p className="text-sm text-sky-600/80 font-medium mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* ---------- Tiêu đề mục ---------- */
export function SectionTitle({ emoji, children, right, className }) {
  return (
    <div className={cx('flex items-center justify-between gap-2 mb-3', className)}>
      <h2 className="font-bold text-sky-800 flex items-center gap-2">
        {emoji && <span>{emoji}</span>}
        {children}
      </h2>
      {right}
    </div>
  )
}

/* ---------- Button ---------- */
const BTN = {
  primary: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky hover:shadow-lg hover:brightness-105',
  soft: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
  white: 'bg-white text-sky-600 border border-sky-200 hover:bg-sky-50 shadow-sm',
  ghost: 'bg-transparent text-sky-600 hover:bg-sky-100',
  danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100',
  gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
}
const SIZE = {
  xs: 'text-xs px-2.5 py-1.5 rounded-lg',
  sm: 'text-xs sm:text-sm px-3 py-2 rounded-xl',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-base px-5 py-3.5 rounded-2xl',
}

export function Button({ variant = 'primary', size = 'md', className, children, loading, disabled, ...rest }) {
  return (
    <button
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap',
        BTN[variant], SIZE[size], className,
      )}
      {...rest}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  )
}

export function IconButton({ className, title, children, ...rest }) {
  return (
    <button
      title={title}
      aria-label={title}
      className={cx('w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors active:scale-90', className)}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ---------- Chip (lọc / chọn) ---------- */
export function Chip({ active, onClick, children, tone = 'pink', className, ...rest }) {
  const act = tone === 'rose'
    ? 'bg-sky-600 text-white border-sky-600 shadow-md'
    : 'bg-sky-500 text-white border-sky-500 shadow-md'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap active:scale-95',
        active ? act : 'bg-white/70 text-sky-700 border-sky-200 hover:bg-sky-100',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ---------- Input / Textarea ---------- */
const FIELD = 'w-full bg-white/90 border border-sky-200 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-sky-300 text-sky-900 focus:border-sky-400 focus:ring-4 focus:ring-sky-100'

export function Input({ className, label, hint, ...rest }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-bold text-sky-700 mb-1.5 ml-1">{label}</span>}
      <input className={cx(FIELD, className)} {...rest} />
      {hint && <span className="block text-[11px] text-gray-400 mt-1 ml-1">{hint}</span>}
    </label>
  )
}

export function Textarea({ className, label, ...rest }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-bold text-sky-700 mb-1.5 ml-1">{label}</span>}
      <textarea className={cx(FIELD, 'resize-none', className)} {...rest} />
    </label>
  )
}

export function Select({ className, label, children, ...rest }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-bold text-sky-700 mb-1.5 ml-1">{label}</span>}
      <select className={cx(FIELD, 'appearance-none', className)} {...rest}>{children}</select>
    </label>
  )
}

/* ---------- Trạng thái ---------- */
export function Spinner({ className = 'w-10 h-10' }) {
  return (
    <svg className={cx('animate-spin text-sky-400', className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function FullScreenLoader() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-3">
      <Spinner />
      <p className="text-sm text-sky-400 font-medium animate-pulse">Đang tải...</p>
    </div>
  )
}

export function EmptyState({ emoji = '📭', title, hint, action }) {
  return (
    <div className="text-center bg-white/50 rounded-3xl p-8 border border-dashed border-sky-200">
      <span className="text-4xl block mb-2">{emoji}</span>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      {hint && <p className="text-xs text-sky-400 mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cx('animate-pulse bg-sky-100 rounded-2xl', className)} />
}

/* ---------- Modal / Sheet (bottom sheet trên mobile, dialog giữa màn hình trên desktop) ---------- */
export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-sky-900/30 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog" aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] flex flex-col"
          >
            <div className="sm:hidden w-10 h-1.5 bg-sky-200 rounded-full mx-auto mt-3" />
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="font-black text-lg text-sky-800">{title}</h3>
              <IconButton title="Đóng" onClick={onClose}>✕</IconButton>
            </div>
            <div className="px-5 pb-4 overflow-y-auto thin-scroll flex-1">{children}</div>
            {footer && <div className="px-5 py-4 border-t border-sky-100 pb-safe">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- Toast + Confirm ---------- */
const FeedbackContext = createContext(null)

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)
  const resolver = useRef(null)

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800)
  }, [])

  const confirm = useCallback((opts) => {
    setConfirmState(typeof opts === 'string' ? { message: opts } : opts)
    return new Promise((resolve) => { resolver.current = resolve })
  }, [])

  const close = (val) => {
    setConfirmState(null)
    resolver.current?.(val)
    resolver.current = null
  }

  const ICON = { success: '💖', error: '💔', info: '💬' }

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toasts */}
      <div className="fixed top-3 sm:top-5 left-0 right-0 z-[110] flex flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={cx(
                'pointer-events-auto px-4 py-2.5 rounded-2xl shadow-lg text-sm font-semibold border backdrop-blur-xl flex items-center gap-2',
                t.type === 'error' ? 'bg-rose-50/95 text-rose-700 border-rose-200' : 'bg-white/95 text-sky-800 border-sky-200',
              )}
            >
              <span>{ICON[t.type] || '💬'}</span>{t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm */}
      <Modal
        open={!!confirmState}
        onClose={() => close(false)}
        title={confirmState?.title || 'Chắc chưa?'}
        footer={
          <div className="flex gap-2">
            <Button variant="gray" className="flex-1" onClick={() => close(false)}>{confirmState?.cancelText || 'Thôi'}</Button>
            <Button variant={confirmState?.danger ? 'danger' : 'primary'} className="flex-1" onClick={() => close(true)}>
              {confirmState?.confirmText || 'Đồng ý'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">{confirmState?.message}</p>
      </Modal>
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback phải dùng trong FeedbackProvider')
  return ctx
}

/* ---------- Cuộn ngang chips ---------- */
export function ChipRow({ drag, children, className }) {
  return (
    <div
      ref={drag?.ref}
      onMouseDown={drag?.onMouseDown}
      className={cx('flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 cursor-grab', className)}
    >
      {children}
    </div>
  )
}
