import { useEffect, useState } from 'react'
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export const PRIORITIES = {
  high: { label: 'Rất thèm', emoji: '🔥' },
  normal: { label: 'Thích', emoji: '💗' },
  low: { label: 'Có cũng được', emoji: '🙂' },
}

export function useWishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'wishlists'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, priority: 'normal', ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [])

  const addItem = (uid, { title, link = '', imageUrl = '', price = '', priority = 'normal', note = '' }) => {
    if (!title.trim()) return Promise.resolve()
    return addDoc(collection(db, 'wishlists'), {
      uid,
      title: title.trim(),
      link: link.trim(),
      imageUrl: imageUrl.trim(),
      price: price.trim(),
      priority,
      note: note.trim(),
      status: 'available',
      createdAt: serverTimestamp(),
    })
  }

  /** Nửa kia lén chốt đơn: chỉ đổi trạng thái, chủ wishlist không nhìn thấy */
  const markAsSurprised = (id) =>
    updateDoc(doc(db, 'wishlists', id), { status: 'surprised', surprisedAt: serverTimestamp() })

  const unmarkSurprised = (id) =>
    updateDoc(doc(db, 'wishlists', id), { status: 'available' })

  const removeItem = (id) => deleteDoc(doc(db, 'wishlists', id))

  return { items, loading, addItem, markAsSurprised, unmarkSurprised, removeItem }
}
