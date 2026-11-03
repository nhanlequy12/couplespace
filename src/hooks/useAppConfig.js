import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const REF = () => doc(db, 'config', 'app_config')

/**
 * Cấu hình chung của cặp đôi: ngày bắt đầu yêu, các ngày đặc biệt (sinh nhật...).
 * Lưu tại config/app_config.
 */
export function useAppConfig() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(REF(), (snap) => {
      setConfig(snap.exists() ? { special_dates: [], ...snap.data() } : { start_date: '', special_dates: [] })
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [])

  const setStartDate = (start_date) => setDoc(REF(), { start_date }, { merge: true })

  const saveSpecialDates = (special_dates) => setDoc(REF(), { special_dates }, { merge: true })

  const addSpecialDate = (item) => {
    const list = [...(config?.special_dates || []), { id: `${Date.now()}`, yearly: true, ...item }]
    return saveSpecialDates(list)
  }

  const removeSpecialDate = (id) =>
    saveSpecialDates((config?.special_dates || []).filter(s => s.id !== id))

  return { config, loading, setStartDate, addSpecialDate, removeSpecialDate }
}
