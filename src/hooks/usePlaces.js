import { useEffect, useState } from 'react'
import {
  collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc,
  serverTimestamp, query, orderBy, increment,
} from 'firebase/firestore'
import { db } from '../firebase'

export function usePlaces() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'places'), orderBy('created_at', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPlaces(snap.docs.map(d => ({ id: d.id, visits: 0, favorite: false, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [])

  const addPlace = ({ name, category, district, link = '', note = '', address = '', price = '' }, addedBy) => {
    if (!name.trim()) return Promise.resolve()
    return addDoc(collection(db, 'places'), {
      name: name.trim(),
      category,
      district,
      map_link: link.trim(),
      note: note.trim(),
      address: address.trim(),
      price,
      visits: 0,
      favorite: false,
      added_by: addedBy,
      created_at: serverTimestamp(),
    })
  }

  const updatePlace = (id, data) => updateDoc(doc(db, 'places', id), data)

  const removePlace = (id) => deleteDoc(doc(db, 'places', id))

  /** Đánh dấu đã ghé thêm 1 lần */
  const markVisited = (id) =>
    updateDoc(doc(db, 'places', id), { visits: increment(1), last_visit: serverTimestamp() })

  const toggleFavorite = (id, current) =>
    updateDoc(doc(db, 'places', id), { favorite: !current })

  return { places, loading, addPlace, updatePlace, removePlace, markVisited, toggleFavorite }
}
