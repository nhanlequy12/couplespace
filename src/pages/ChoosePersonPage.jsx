import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'

const CLOUDS = [
  { top: '8%', left: '4%', size: 'text-5xl', delay: '0s', dur: '7s' },
  { top: '18%', left: '82%', size: 'text-4xl', delay: '1.5s', dur: '9s' },
  { top: '62%', left: '6%', size: 'text-3xl', delay: '3s', dur: '8s' },
  { top: '78%', left: '86%', size: 'text-5xl', delay: '0.5s', dur: '10s' },
  { top: '88%', left: '45%', size: 'text-3xl', delay: '2s', dur: '7s' },
]

const avatarFor = (sex) => (sex === 'male' ? '🧸' : sex === 'female' ? '🐰' : '💙')

/** Màn hình chọn "mình là ai" – thay cho trang đăng nhập */
export default function ChoosePersonPage() {
  const { users, choose } = useAuth()
  const [name, setName] = useState('')
  const [sex, setSex] = useState('female')

  const manual = users.length === 0

  const submitManual = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    choose({ uid: `local-${sex}`, name: name.trim(), fullName: name.trim(), sex })
  }

  return (
    <div className="relative min-h-dvh overflow-hidden flex items-center justify-center px-4 py-8">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply blur-3xl opacity-60 animate-blob" />
      <div className="absolute -top-10 -right-16 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-16 left-[20%] w-72 h-72 bg-cyan-100 rounded-full mix-blend-multiply blur-3xl opacity-60 animate-blob animation-delay-4000" />
      {CLOUDS.map((c, i) => (
        <span key={i} className={`absolute ${c.size} opacity-60 animate-float select-none pointer-events-none`}
          style={{ top: c.top, left: c.left, animationDelay: c.delay, animationDuration: c.dur }}>☁️</span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md card p-7 sm:p-10 text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-sky bg-gradient-to-br from-sky-300 to-blue-500 text-4xl">
          ☁️
        </div>
        <h1 className="text-3xl font-black text-gradient">CoupleSpace</h1>
        <p className="mt-1 text-sm text-sky-600 font-medium">Góc nhỏ của hai đứa mình</p>

        <p className="mt-8 mb-4 text-sm font-bold text-sky-800">Bạn là ai nè? 👀</p>

        {manual ? (
          <form onSubmit={submitManual} className="space-y-4 text-left">
            <Input label="Tên của bạn" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vd: BP" autoFocus />
            <div>
              <span className="block text-xs font-bold text-sky-700 mb-1.5 ml-1">Bạn là</span>
              <div className="grid grid-cols-2 gap-2">
                {[['male', '🧸 Bạn nam'], ['female', '🐰 Bạn nữ']].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setSex(v)}
                    className={`py-3 rounded-xl font-bold text-sm border transition-all ${sex === v ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-transparent shadow-sky' : 'bg-white border-sky-200 text-sky-700 hover:bg-sky-50'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={!name.trim()}>Vào thôi ☁️</Button>
            <p className="text-[11px] text-gray-400 text-center">Không đọc được danh sách người dùng trên Firestore nên bạn tự nhập nha.</p>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {users.map(u => (
              <button
                key={u.uid}
                onClick={() => choose(u)}
                className="group rounded-3xl border border-sky-100 bg-white/80 p-5 hover:border-sky-300 hover:shadow-sky hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">{avatarFor(u.sex)}</div>
                <p className="font-black text-sky-800 truncate">{u.name}</p>
                <p className="text-[11px] text-sky-400">{u.sex === 'male' ? 'Bạn nam' : u.sex === 'female' ? 'Bạn nữ' : ''}</p>
              </button>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-sky-300 mt-8 select-none">Lựa chọn được nhớ trên máy này 💙</p>
      </motion.div>
    </div>
  )
}
