/* eslint-disable react-refresh/only-export-components -- Provider + hook useAuth đi chung một file */
import { createContext, useContext, useEffect, useState } from 'react'
import { signInAnonymously } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const AuthContext = createContext(null)

const STORAGE_KEY = 'cs_profile'

const readSaved = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
}

const normalize = (id, data) => ({
  uid: id,
  name: data.first_name || data.name || 'Bạn',
  fullName: data.name || data.first_name || '',
  sex: data.sex || null,
  avatar: data.avatar || null,
})

/**
 * Không còn đăng nhập bằng mật khẩu: mỗi máy chỉ cần chọn "mình là ai" một lần,
 * lựa chọn được nhớ trong localStorage. Danh sách người dùng lấy từ collection `users`
 * (nếu không đọc được thì cho phép tự nhập tên + giới tính).
 */
export function AuthProvider({ children }) {
  const [users, setUsers] = useState([])
  const [profile, setProfile] = useState(readSaved)
  const [loading, setLoading] = useState(true)
  const [dbBlocked, setDbBlocked] = useState(false) // Firestore từ chối vì chưa đăng nhập

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      // Đăng nhập ẩn danh để Firestore rules kiểu `request.auth != null` vẫn chạy được.
      // Nếu project chưa bật Anonymous sign-in thì bỏ qua.
      try { await signInAnonymously(auth) } catch { /* ignore */ }
      try {
        const snap = await getDocs(collection(db, 'users'))
        if (!cancelled) setUsers(snap.docs.map(d => normalize(d.id, d.data())))
      } catch (e) {
        // không có quyền đọc → dùng hồ sơ tự nhập, và báo cho người dùng biết
        if (!cancelled && e?.code === 'permission-denied') setDbBlocked(true)
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Nếu hồ sơ đã lưu trùng với một user trên Firestore thì lấy dữ liệu mới nhất (tên đổi là thấy)
  const current = profile && (users.find(u => u.uid === profile.uid) || profile)
  const partner = current
    ? users.find(u => u.uid !== current.uid) || (current.sex ? { uid: 'partner', name: 'Nửa kia', sex: current.sex === 'male' ? 'female' : 'male' } : null)
    : null

  const choose = (p) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
    setProfile(p)
  }

  const switchUser = () => {
    localStorage.removeItem(STORAGE_KEY)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user: current, profile: current, partner, users, loading, dbBlocked, choose, switchUser, logout: switchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider')
  return ctx
}
