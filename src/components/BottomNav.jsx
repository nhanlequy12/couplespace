import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV_ITEMS } from './nav'

/** Thanh điều hướng dưới màn hình – chỉ hiện trên mobile/tablet */
export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pb-safe pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md flex items-center bg-white/85 backdrop-blur-2xl border border-white rounded-3xl shadow-[0_10px_40px_rgba(232,72,111,0.22)] p-1.5">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className="relative flex-1 flex flex-col items-center justify-center py-2 rounded-2xl"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky"
                  />
                )}
                <span className={`relative z-10 text-xl leading-none transition-transform ${isActive ? 'scale-110' : ''}`}>{item.emoji}</span>
                <span className={`relative z-10 text-[11px] font-bold mt-1 ${isActive ? 'text-white' : 'text-sky-700/60'}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
