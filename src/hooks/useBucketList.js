import { useEffect, useState } from 'react'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export const BUCKET_STATUS = {
  dreaming: { label: 'Đang mơ mộng', emoji: '☁️', color: 'text-sky-500' },
  planning: { label: 'Lên kế hoạch', emoji: '📝', color: 'text-indigo-500' },
  completed: { label: 'Đã hoàn thành', emoji: '🎉', color: 'text-emerald-500' },
}

export function useBucketList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'bucket_list'), orderBy('created_at', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [])

  const addItem = ({ title, emoji = '✨', target_date = '', place = '' }, addedBy) => {
    if (!title.trim()) return Promise.resolve()
    return addDoc(collection(db, 'bucket_list'), {
      title: title.trim(),
      emoji,
      target_date,
      place: place.trim(),
      status: 'dreaming',
      added_by: addedBy,
      created_at: serverTimestamp(),
    })
  }

  const updateStatus = (id, status) => {
    const data = { status }
    if (status === 'completed') data.completed_at = serverTimestamp()
    return updateDoc(doc(db, 'bucket_list', id), data)
  }

  const updateItem = (id, data) => updateDoc(doc(db, 'bucket_list', id), data)

  const removeItem = (id) => deleteDoc(doc(db, 'bucket_list', id))

  return { items, loading, addItem, updateStatus, updateItem, removeItem }
}
