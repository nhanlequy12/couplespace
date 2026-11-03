import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useDailyLog } from '../hooks/useDailyLog'
import { useAppConfig } from '../hooks/useAppConfig'
import { daysTogether, upcomingEvents, formatVN, formatVNLong, greetingByHour } from '../lib/date'
import { Card, SectionTitle, Button, Input, Textarea, FullScreenLoader, Skeleton, useFeedback } from '../components/ui'

const MOODS = [
  { id: 'happy', icon: '😁', label: 'Vui vẻ' },
  { id: 'missing', icon: '💞', label: 'Nhớ nhung' },
  { id: 'hungry', icon: '🤤', label: 'Đói bụng' },
  { id: 'sad', icon: '🥺', label: 'Buồn' },
  { id: 'angry', icon: '😾', label: 'Dận dỗi' },
  { id: 'grumpy', icon: '😒', label: 'Khó ở' },
  { id: 'period', icon: '🍓', label: 'Tới dâu' },
  { id: 'headache', icon: '😵', label: 'Chóng mặt' },
  { id: 'tired', icon: '😫', label: 'Mệt mỏi' },
  { id: 'sleepy', icon: '💤', label: 'Buồn ngủ' },
  { id: 'bored', icon: '🥱', label: 'Chán' },
  { id: 'smug', icon: '😏', label: 'Mặt láo toét' },
  { id: 'lazy', icon: '🦥', label: 'Lười biếng' },
  { id: 'stressed', icon: '🤯', label: 'Áp lực' },
  { id: 'sick', icon: '🤧', label: 'Ốm rồi' },
  { id: 'excited', icon: '🤩', label: 'Hào hứng' },
]

const moodOf = (id) => MOODS.find(m => m.id === id) || { icon: '😶', label: 'Chưa chọn' }

const fmtTime = (ts) => ts?.toDate ? ts.toDate().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''

export default function HomePage() {
  const { profile, partner } = useAuth()
  const { dailyData, loading, updateMood, addCraving, removeCraving, setNote } = useDailyLog()
  const { config, loading: configLoading } = useAppConfig()
  const { toast } = useFeedback()

  const [foodInput, setFoodInput] = useState('')
  const [showMoods, setShowMoods] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [editingNote, setEditingNote] = useState(false)

  const sex = profile?.sex
  const me = sex === 'male' ? 'boy' : 'girl'
  const them = sex === 'male' ? 'girl' : 'boy'

  const myNote = dailyData?.[`${me}_note`] || ''
  const startEditNote = () => { setNoteDraft(myNote); setEditingNote(true) }

  if (loading || !dailyData) return <FullScreenLoader />

  if (!sex) {
    return (
      <Card className="text-center py-10">
        <p className="text-4xl mb-3">🙈</p>
        <p className="font-bold text-sky-800">Tài khoản chưa có giới tính (sex) trong Firestore</p>
        <p className="text-sm text-gray-500 mt-1">Thêm field <code>sex: "male" | "female"</code> vào <code>users/{profile?.uid}</code> nhé.</p>
      </Card>
    )
  }

  const myMood = moodOf(dailyData[`${me}_mood`])
  const partnerMood = moodOf(dailyData[`${them}_mood`])
  const myCravings = dailyData[`${me}_cravings`] || []
  const partnerCravings = dailyData[`${them}_cravings`] || []
  const partnerNote = dailyData[`${them}_note`] || ''

  const days = daysTogether(config?.start_date)
  const events = upcomingEvents(config?.start_date, config?.special_dates || [])

  const handleAddFood = async (e) => {
    e.preventDefault()
    if (!foodInput.trim()) return
    try {
      await addCraving(sex, foodInput)
      setFoodInput('')
    } catch { toast('Không lưu được, thử lại nha', 'error') }
  }

  const handleMood = async (id) => {
    try {
      await updateMood(sex, id)
      setShowMoods(false)
      toast(`Đã cập nhật: ${moodOf(id).icon} ${moodOf(id).label}`)
    } catch { toast('Không lưu được, thử lại nha', 'error') }
  }

  const saveNote = async () => {
    try {
      await setNote(sex, noteDraft)
      setEditingNote(false)
      toast('Đã gửi lời nhắn 💌')
    } catch { toast('Không lưu được, thử lại nha', 'error') }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero: đếm ngày */}
      <motion.section
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white p-6 sm:p-8 lg:p-10 shadow-sky"
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-6 bottom-4 text-7xl sm:text-8xl opacity-25 select-none animate-float">☁️</div>
        <div className="relative grid gap-4 sm:grid-cols-2 sm:items-end">
          <div>
            <p className="text-white/85 text-sm font-semibold">{greetingByHour()}, {profile.name} 💕</p>
            <p className="text-white/70 text-xs mt-1 capitalize">{formatVNLong(new Date())}</p>
            <div className="mt-4 flex items-end gap-2">
              {configLoading ? (
                <Skeleton className="w-32 h-14 bg-white/30" />
              ) : config?.start_date ? (
                <>
                  <span className="text-6xl sm:text-7xl font-black leading-none drop-shadow">{days}</span>
                  <span className="text-xl sm:text-2xl font-bold mb-1.5">ngày bên nhau</span>
                </>
              ) : (
                <Link to="/settings" className="text-sm underline underline-offset-4">Chưa đặt ngày bắt đầu yêu → vào Cài đặt</Link>
              )}
            </div>
            {config?.start_date && (
              <p className="text-white/75 text-xs mt-2">Từ ngày {formatVN(config.start_date)} ✨</p>
            )}
          </div>
          <div className="flex sm:justify-end gap-3">
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center min-w-[96px]">
              <p className="text-3xl">{myMood.icon}</p>
              <p className="text-[11px] font-bold mt-1 truncate max-w-[90px]">{profile.name}</p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center min-w-[96px]">
              <p className="text-3xl">{partnerMood.icon}</p>
              <p className="text-[11px] font-bold mt-1 truncate max-w-[90px]">{partner?.name || 'Nửa kia'}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
        {/* Cột chính */}
        <div className="lg:col-span-2 min-w-0 space-y-5 sm:space-y-6">
          {/* Tâm trạng */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <SectionTitle emoji="✨">Tâm trạng hôm nay</SectionTitle>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setShowMoods(v => !v)}
                  className="relative bg-gradient-to-b from-sky-50 to-sky-100 rounded-2xl p-4 text-center border border-sky-200 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="text-4xl sm:text-5xl mb-2 drop-shadow-md">{myMood.icon}</div>
                  <p className="text-sm font-bold text-sky-700 truncate">{profile.name} (bạn)</p>
                  <p className="text-xs text-sky-500">{myMood.label}{dailyData[`${me}_mood_at`] && ` · ${fmtTime(dailyData[`${me}_mood_at`])}`}</p>
                  <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow">✎</span>
                </button>
                <div className="bg-white/70 rounded-2xl p-4 text-center border border-sky-100">
                  <div className="text-4xl sm:text-5xl mb-2 drop-shadow-md">{partnerMood.icon}</div>
                  <p className="text-sm font-bold text-gray-600 truncate">{partner?.name || 'Nửa kia'}</p>
                  <p className="text-xs text-gray-400">{partnerMood.label}{dailyData[`${them}_mood_at`] && ` · ${fmtTime(dailyData[`${them}_mood_at`])}`}</p>
                </div>
              </div>

              <AnimatePresence>
                {showMoods && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                      {MOODS.map(m => (
                        <button
                          key={m.id}
                          onClick={() => handleMood(m.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${myMood.id === m.id ? 'bg-sky-100 border-sky-300 shadow-inner' : 'bg-white border-sky-100 hover:bg-sky-50'}`}
                        >
                          <span className="text-2xl">{m.icon}</span>
                          <span className="text-[10px] font-semibold text-sky-700 leading-tight text-center">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Thèm gì / muốn nói gì */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <SectionTitle emoji="🍕" right={<Link to="/explore" className="text-xs font-bold text-sky-500 hover:underline">Quay quán →</Link>}>
                Hôm nay thèm gì hong
              </SectionTitle>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-white/70 rounded-2xl p-3.5 border border-sky-100">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">{partner?.name || 'Nửa kia'}</p>
                  <div className="flex flex-wrap gap-2">
                    {partnerCravings.length ? partnerCravings.map((f, i) => (
                      <span key={i} className="pill bg-sky-100 text-sky-700 border border-sky-200 text-sm py-1.5">{f}</span>
                    )) : <span className="text-sm text-gray-400 italic">Chưa thèm gì...</span>}
                  </div>
                </div>

                <div className="bg-sky-50/70 rounded-2xl p-3.5 border border-sky-100">
                  <p className="text-xs font-bold text-sky-500 mb-2 uppercase tracking-wide">Bạn</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {myCravings.length ? myCravings.map((f, i) => (
                      <button key={i} onClick={() => removeCraving(sex, f)} title="Bấm để xoá"
                        className="pill bg-white text-sky-600 border border-sky-200 hover:bg-rose-50 hover:text-rose-500 text-sm py-1.5 group">
                        {f} <span className="text-[10px] text-sky-300 group-hover:text-rose-400">✕</span>
                      </button>
                    )) : <span className="text-sm text-sky-300 italic">Thèm gì thì gõ vào nè</span>}
                  </div>
                  <form onSubmit={handleAddFood} className="flex gap-2">
                    <Input value={foodInput} onChange={(e) => setFoodInput(e.target.value)} placeholder="Trà sữa, bún bò..." className="py-2.5" />
                    <Button type="submit" size="md" disabled={!foodInput.trim()}>Thêm</Button>
                  </form>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Cột phụ */}
        <div className="min-w-0 space-y-5 sm:space-y-6">
          {/* Lời nhắn hôm nay */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <SectionTitle emoji="💌">Lời nhắn hôm nay</SectionTitle>

              <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 p-4 mb-3 min-h-[76px]">
                <p className="text-[11px] font-bold text-sky-400 uppercase mb-1">Từ {partner?.name || 'nửa kia'}</p>
                {partnerNote
                  ? <p className="text-sm text-sky-900 leading-relaxed whitespace-pre-wrap">“{partnerNote}”</p>
                  : <p className="text-sm text-gray-400 italic">Hôm nay chưa có lời nhắn nào...</p>}
                {dailyData[`${them}_note_at`] && <p className="text-[10px] text-gray-400 mt-1">{fmtTime(dailyData[`${them}_note_at`])}</p>}
              </div>

              {editingNote ? (
                <div className="space-y-2">
                  <Textarea rows={3} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Viết gì đó cho người ta đọc..." autoFocus />
                  <div className="flex gap-2">
                    <Button variant="gray" size="sm" className="flex-1" onClick={() => setEditingNote(false)}>Huỷ</Button>
                    <Button size="sm" className="flex-1" onClick={saveNote}>Gửi 💌</Button>
                  </div>
                </div>
              ) : (
                <button onClick={startEditNote} className="w-full text-left rounded-2xl border border-dashed border-sky-200 p-3 hover:bg-sky-50 transition-colors">
                  <p className="text-[11px] font-bold text-sky-400 uppercase mb-1">Lời nhắn của bạn</p>
                  <p className="text-sm text-sky-800 whitespace-pre-wrap">{myNote || <span className="text-sky-300 italic">Bấm để viết...</span>}</p>
                </button>
              )}
            </Card>
          </motion.div>

          {/* Sự kiện sắp tới */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <SectionTitle emoji="📅" right={<Link to="/settings" className="text-xs font-bold text-sky-500 hover:underline">Sửa →</Link>}>
                Sắp tới
              </SectionTitle>
              {events.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Đặt ngày bắt đầu yêu & sinh nhật trong Cài đặt để thấy đếm ngược nha.</p>
              ) : (
                <ul className="space-y-2">
                  {events.map(ev => (
                    <li key={ev.id} className="flex items-center gap-3 rounded-2xl bg-white/70 border border-sky-100 px-3 py-2.5">
                      <span className="text-2xl">{ev.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-sky-800 truncate">{ev.label}</p>
                        <p className="text-[11px] text-gray-400">{formatVN(ev.date)}</p>
                      </div>
                      <span className={`pill ${ev.daysLeft === 0 ? 'bg-sky-500 text-white' : ev.daysLeft <= 7 ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'}`}>
                        {ev.daysLeft === 0 ? 'Hôm nay! 🎉' : `còn ${ev.daysLeft} ngày`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
