import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { toDateKey } from '../lib/date'

const EMPTY = {
  boy_mood: 'normal',
  girl_mood: 'normal',
  boy_cravings: [],
  girl_cravings: [],
  boy_note: '',
  girl_note: '',
}

const field = (sex, base) => `${sex === 'male' ? 'boy' : 'girl'}_${base}`

/** Nhật ký theo ngày: tâm trạng, "hôm nay thèm gì", lời nhắn cho nhau */
export function useDailyLog() {
  const [dailyData, setDailyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [todayKey, setTodayKey] = useState(() => toDateKey())

  // Qua ngày mới (app mở qua đêm) thì tự chuyển sang doc mới
  useEffect(() => {
    const t = setInterval(() => {
      const k = toDateKey()
      setTodayKey(prev => (prev === k ? prev : k))
    }, 60 * 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const ref = doc(db, 'daily_logs', todayKey)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setDailyData({ ...EMPTY, ...snap.data() })
        setLoading(false)
      } else {
        // merge để 2 máy cùng tạo không ghi đè nhau
        setDoc(ref, { ...EMPTY, created_at: serverTimestamp() }, { merge: true })
          .catch(() => {})
          .finally(() => { setDailyData(EMPTY); setLoading(false) })
      }
    }, () => { setDailyData(d => d || EMPTY); setLoading(false) })
    return () => unsub()
  }, [todayKey])

  const ref = () => doc(db, 'daily_logs', todayKey)

  const updateMood = (sex, mood) =>
    updateDoc(ref(), { [field(sex, 'mood')]: mood, [field(sex, 'mood_at')]: serverTimestamp() })

  const addCraving = (sex, text) => {
    const v = text.trim()
    if (!v) return Promise.resolve()
    return updateDoc(ref(), { [field(sex, 'cravings')]: arrayUnion(v) })
  }

  const removeCraving = (sex, text) =>
    updateDoc(ref(), { [field(sex, 'cravings')]: arrayRemove(text) })

  const setNote = (sex, text) =>
    updateDoc(ref(), { [field(sex, 'note')]: text.trim(), [field(sex, 'note_at')]: serverTimestamp() })

  return { dailyData, loading, todayKey, updateMood, addCraving, removeCraving, setNote }
}
