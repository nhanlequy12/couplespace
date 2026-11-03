import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useFeedback } from './ui'
import BottomNav from './BottomNav'
import { NAV_ITEMS, SETTINGS_ITEM } from './nav'

function Avatar({ profile, size = 'w-9 h-9 text-base' }) {
  const emoji = profile?.sex === 'male' ? '🧸' : profile?.sex === 'female' ? '🐰' : '💙'
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-sky-200 to-sky-300 flex items-center justify-center shadow-inner shrink-0`}>
      {profile?.avatar ? <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : emoji}
    </div>
  )
}

function Sidebar() {
  const { profile, partner, switchUser } = useAuth()
  const { confirm, toast } = useFeedback()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (!(await confirm({ title: 'Đổi người dùng?', message: 'Quay lại màn hình chọn "mình là ai" nha ☁️', confirmText: 'Đổi' }))) return
    switchUser()
    toast('Chọn lại người dùng nha', 'info')
    navigate('/home')
  }

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col bg-white/70 backdrop-blur-2xl border-r border-white/80 shadow-[8px_0_40px_rgba(232,72,111,0.06)] z-40">
      <Link to="/home" className="flex items-center gap-3 px-6 pt-7 pb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-sky">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div>
          <p className="font-black text-lg text-gradient leading-tight">CoupleSpace</p>
          <p className="text-[11px] text-sky-400 font-semibold">Góc nhỏ của hai đứa</p>
        </div>
      </Link>

      <nav className="flex-1 px-4 space-y-1">
        {[...NAV_ITEMS, SETTINGS_ITEM].map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className="relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors group"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-pill"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky"
                  />
                )}
                <span className="relative z-10 text-xl w-7 text-center">{item.emoji}</span>
                <span className="relative z-10 min-w-0">
                  <span className={`block text-sm font-bold ${isActive ? 'text-white' : 'text-sky-800 group-hover:text-sky-600'}`}>{item.label}</span>
                  <span className={`block text-[11px] ${isActive ? 'text-white/80' : 'text-sky-400'}`}>{item.desc}</span>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <div className="card p-3 flex items-center gap-3">
          <Avatar profile={profile} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-sky-800 truncate">{profile?.name}</p>
            <p className="text-[11px] text-sky-400 truncate">💞 {partner?.name || 'Nửa kia'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Đổi người dùng"
            className="w-9 h-9 rounded-xl text-sky-400 hover:bg-sky-100 hover:text-sky-600 transition-colors"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}

function MobileHeader() {
  const { profile } = useAuth()
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-sky-50/80 backdrop-blur-xl border-b border-white/60">
      <div className="flex items-center justify-between px-4 h-14">
        <Link to="/home" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-sky">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
          <span className="font-black text-gradient">CoupleSpace</span>
        </Link>
        <Link to="/settings" className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-white/70 transition-colors">
          <span className="text-xs font-bold text-sky-700 max-w-[90px] truncate">{profile?.name}</span>
          <Avatar profile={profile} size="w-8 h-8 text-sm" />
        </Link>
      </div>
    </header>
  )
}

function DbBlockedBanner() {
  const { dbBlocked } = useAuth()
  if (!dbBlocked) return null
  return (
    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-800">
      <p className="font-bold">⚠️ Firestore đang chặn truy cập không đăng nhập, nên app chưa đọc/ghi được dữ liệu.</p>
      <p className="text-xs mt-1">
        Vào Firebase Console → Authentication → Sign-in method → bật <b>Anonymous</b>, rồi tải lại trang.
        (Hoặc sửa Firestore Rules cho phép truy cập không cần auth.)
      </p>
    </div>
  )
}

export default function AppLayout() {
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileHeader />
      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-10 pb-28 lg:pb-14">
          <DbBlockedBanner />
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
