// Tiện ích ngày tháng dùng chung (theo giờ địa phương)

const DAY_MS = 1000 * 60 * 60 * 24

export function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** 'YYYY-MM-DD' theo giờ địa phương */
export function toDateKey(d = new Date()) {
  const x = startOfDay(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse 'YYYY-MM-DD' thành Date địa phương (tránh lệch múi giờ của new Date('YYYY-MM-DD')) */
export function parseDateKey(key) {
  if (!key) return null
  const [y, m, d] = String(key).split('-').map(Number)
  if (!y || !m || !d) {
    const fallback = new Date(key)
    return isNaN(fallback) ? null : startOfDay(fallback)
  }
  return new Date(y, m - 1, d)
}

export function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS)
}

/** Số ngày đã bên nhau (ngày đầu tính là ngày 1) */
export function daysTogether(startKey, today = new Date()) {
  const start = parseDateKey(startKey)
  if (!start) return 0
  return Math.max(0, daysBetween(start, today) + 1)
}

export function formatVN(dateOrKey, opts = {}) {
  const d = dateOrKey instanceof Date ? dateOrKey : parseDateKey(dateOrKey)
  if (!d) return ''
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', ...opts })
}

export function formatVNLong(dateOrKey) {
  const d = dateOrKey instanceof Date ? dateOrKey : parseDateKey(dateOrKey)
  if (!d) return ''
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** Lần tiếp theo (>= hôm nay) của một ngày/tháng trong năm */
export function nextYearly(month, day, today = new Date()) {
  const t = startOfDay(today)
  let next = new Date(t.getFullYear(), month - 1, day)
  if (next < t) next = new Date(t.getFullYear() + 1, month - 1, day)
  return next
}

/** Lần tiếp theo (>= hôm nay) của một ngày trong tháng */
export function nextMonthly(day, today = new Date()) {
  const t = startOfDay(today)
  let next = new Date(t.getFullYear(), t.getMonth(), day)
  if (next < t) next = new Date(t.getFullYear(), t.getMonth() + 1, day)
  return next
}

/**
 * Danh sách sự kiện sắp tới, đã sắp xếp theo số ngày còn lại.
 * startKey: ngày bắt đầu yêu; specialDates: [{ label, date: 'YYYY-MM-DD', yearly: bool }]
 */
export function upcomingEvents(startKey, specialDates = [], today = new Date(), limit = 4) {
  const t = startOfDay(today)
  const events = []
  const start = parseDateKey(startKey)

  if (start) {
    // Kỷ niệm năm
    const yearly = nextYearly(start.getMonth() + 1, start.getDate(), t)
    const years = yearly.getFullYear() - start.getFullYear()
    if (years > 0) {
      events.push({ id: 'anniv-year', emoji: '💍', label: `Kỷ niệm ${years} năm yêu nhau`, date: yearly })
    }
    // Kỷ niệm tháng (cùng ngày mỗi tháng)
    const monthly = nextMonthly(start.getDate(), t)
    if (daysBetween(t, monthly) !== daysBetween(t, yearly)) {
      const months = (monthly.getFullYear() - start.getFullYear()) * 12 + (monthly.getMonth() - start.getMonth())
      if (months > 0) {
        events.push({ id: 'anniv-month', emoji: '🌙', label: `Tròn ${months} tháng bên nhau`, date: monthly })
      }
    }
    // Mốc ngày chẵn (100, 200, 500, 1000...)
    const days = daysTogether(startKey, t)
    const milestones = [100, 200, 300, 365, 500, 730, 1000, 1500, 2000, 3000, 5000, 10000]
    const nextMilestone = milestones.find(m => m > days)
    if (nextMilestone) {
      const d = new Date(start)
      d.setDate(d.getDate() + nextMilestone - 1)
      events.push({ id: `ms-${nextMilestone}`, emoji: '🎯', label: `Mốc ${nextMilestone} ngày`, date: d })
    }
  }

  for (const s of specialDates) {
    const d = parseDateKey(s.date)
    if (!d) continue
    const next = s.yearly === false ? d : nextYearly(d.getMonth() + 1, d.getDate(), t)
    if (next < t) continue
    events.push({ id: s.id || `${s.label}-${s.date}`, emoji: s.emoji || '🎂', label: s.label, date: next })
  }

  return events
    .map(e => ({ ...e, daysLeft: daysBetween(t, e.date) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, limit)
}

export function greetingByHour(h = new Date().getHours()) {
  if (h < 5) return 'Khuya rồi, ngủ sớm nha'
  if (h < 11) return 'Chào buổi sáng'
  if (h < 14) return 'Trưa rồi, ăn gì chưa?'
  if (h < 18) return 'Chiều vui vẻ'
  return 'Buổi tối an lành'
}
