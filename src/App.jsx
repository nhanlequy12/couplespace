import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { FullScreenLoader } from './components/ui'
import AppLayout from './components/AppLayout'
import ChoosePersonPage from './pages/ChoosePersonPage'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import BucketListPage from './pages/BucketListPage'
import WishlistPage from './pages/WishlistPage'
import SettingsPage from './pages/SettingsPage'

/** Chưa chọn "mình là ai" thì hiện màn chọn người, không cần mật khẩu */
function RequireProfile({ children }) {
  const { profile, loading } = useAuth()
  if (loading && !profile) return <FullScreenLoader />
  return profile ? children : <ChoosePersonPage />
}

export default function App() {
  return (
    <Routes>
      <Route element={<RequireProfile><AppLayout /></RequireProfile>}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/bucket-list" element={<BucketListPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
