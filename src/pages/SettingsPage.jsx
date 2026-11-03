import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAppConfig } from '../hooks/useAppConfig'
import { formatVN, daysTogether, toDateKey } from '../lib/date'
import { Card, PageHeader, SectionTitle, Button, IconButton, Input, Chip, EmptyState, useFeedback } from '../components/ui'

const EVENT_EMOJIS = ['🎂', '💍', '💌', '🎄', '🧧', '🎓', '✈️', '🏠', '⭐']

export default function SettingsPage() {
  const { profile, partner, switchUser } = useAuth()
  const { config, setStartDate, addSpecialDate, removeSpecialDate } = useAppConfig()
  const { toast, confirm } = useFeedback()
  const navigate = useNavigate()

  const [startEdited, setStartDraft] = useState(null) // null = chưa sửa, hiển thị giá trị đang lưu
  const startDraft = startEdited ?? config?.start_date ?? ''
  const [ev, setEv] = useState({ label: '', date: '', emoji: '🎂' })
  const [installEvt, setInstallEvt] = useState(null)

  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallEvt(e) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])

  const saveStart = async () => {
    if (!startDraft) return
    try { await setStartDate(startDraft); setStartDraft(null); toast('Đã lưu ngày bắt đầu yêu 💞') } catch { toast('Không lưu được (kiểm tra quyền Firestore)', 'error') }
  }

  const addEvent = async (e) => {
    e.preventDefault()
    if (!ev.label.trim() || !ev.date) return
    try {
      await addSpecialDate({ label: ev.label.trim(), date: ev.date, emoji: ev.emoji })
      setEv({ label: '', date: '', emoji: '🎂' })
      toast('Đã thêm sự kiện 📅')
    } catch { toast('Không lưu được', 'error') }
  }

  const removeEvent = async (s) => {
    if (!(await confirm({ title: 'Xoá sự kiện?', message: s.label, confirmText: 'Xoá', danger: true }))) return
    try { await removeSpecialDate(s.id) } catch { toast('Không xoá được', 'error') }
  }

  const handleSwitch = async () => {
    if (!(await confirm({ title: 'Đổi người dùng?', message: 'Quay lại màn hình chọn "mình là ai" nha ☁️', confirmText: 'Đổi' }))) return
    switchUser()
    navigate('/home')
  }

  const install = async () => {
    if (!installEvt) return
    installEvt.prompt()
    const { outcome } = await installEvt.userChoice
    if (outcome === 'accepted') { toast('Đã cài app lên màn hình chính 📱'); setInstallEvt(null) }
  }

  const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone

  return (
    <div>
      <PageHeader emoji="⚙️" title="Cài đặt" subtitle="Ngày yêu, sự kiện đặc biệt và tài khoản" />

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        {/* Hồ sơ */}
        <Card>
          <SectionTitle emoji="👫">Hai đứa mình</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[{ p: profile, tag: 'Bạn' }, { p: partner, tag: 'Nửa kia' }].map(({ p, tag }) => (
              <div key={tag} className="rounded-2xl bg-sky-50/70 border border-sky-100 p-4 text-center">
                <div className="text-4xl mb-1">{p?.sex === 'male' ? '🧸' : p?.sex === 'female' ? '🐰' : '💙'}</div>
                <p className="font-bold text-sky-800 truncate">{p?.name || '—'}</p>
                <p className="text-[11px] text-gray-400">{tag}{p?.sex && ` · ${p.sex === 'male' ? 'Nam' : 'Nữ'}`}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-3">Tên & giới tính lấy từ <code>users/{'{uid}'}</code> trên Firestore. Lựa chọn "mình là ai" được nhớ trên máy này.</p>
        </Card>

        {/* Ngày bắt đầu */}
        <Card>
          <SectionTitle emoji="💞">Ngày bắt đầu yêu</SectionTitle>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input label="Ngày" type="date" max={toDateKey()} value={startDraft} onChange={(e) => setStartDraft(e.target.value)} />
            </div>
            <Button onClick={saveStart} disabled={!startDraft || startDraft === config?.start_date}>Lưu</Button>
          </div>
          {config?.start_date && (
            <p className="text-sm text-sky-600 font-semibold mt-3">
              Từ {formatVN(config.start_date)} → hôm nay là ngày thứ <span className="font-black">{daysTogether(config.start_date)}</span> 🥰
            </p>
          )}
        </Card>

        {/* Sự kiện đặc biệt */}
        <Card className="lg:col-span-2">
          <SectionTitle emoji="📅">Ngày đặc biệt (sinh nhật, kỷ niệm...)</SectionTitle>
          <form onSubmit={addEvent} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end mb-4">
            <Input label="Tên sự kiện" value={ev.label} onChange={(e) => setEv(x => ({ ...x, label: e.target.value }))} placeholder="Vd: Sinh nhật BP" />
            <Input label="Ngày (lặp lại mỗi năm)" type="date" value={ev.date} onChange={(e) => setEv(x => ({ ...x, date: e.target.value }))} />
            <Button type="submit" disabled={!ev.label.trim() || !ev.date}>+ Thêm</Button>
            <div className="sm:col-span-3 flex flex-wrap gap-1.5">
              {EVENT_EMOJIS.map(e => <Chip key={e} active={ev.emoji === e} onClick={() => setEv(x => ({ ...x, emoji: e }))} className="px-2.5">{e}</Chip>)}
            </div>
          </form>

          {(config?.special_dates || []).length === 0 ? (
            <EmptyState emoji="🎂" title="Chưa có ngày đặc biệt nào." hint="Thêm sinh nhật 2 đứa để trang chủ đếm ngược nha" />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {config.special_dates.map(s => (
                <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-white/70 border border-sky-100 px-3 py-2.5">
                  <span className="text-2xl">{s.emoji || '🎂'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-sky-800 truncate">{s.label}</p>
                    <p className="text-[11px] text-gray-400">{formatVN(s.date)} · mỗi năm</p>
                  </div>
                  <IconButton title="Xoá" onClick={() => removeEvent(s)}>✕</IconButton>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* App */}
        <Card>
          <SectionTitle emoji="📱">Ứng dụng</SectionTitle>
          {isStandalone ? (
            <p className="text-sm text-gray-500">Đang chạy như app trên màn hình chính ✅</p>
          ) : installEvt ? (
            <Button variant="white" onClick={install}>⬇️ Cài lên màn hình chính</Button>
          ) : (
            <p className="text-sm text-gray-500">
              Trên iPhone: Safari → nút Chia sẻ → <b>Thêm vào MH chính</b>.<br />
              Trên Android/Chrome: menu ⋮ → <b>Cài đặt ứng dụng</b>.
            </p>
          )}
        </Card>

        <Card>
          <SectionTitle emoji="🔄">Người dùng</SectionTitle>
          <p className="text-sm text-gray-500 mb-3">Đang dùng với tư cách <b className="text-sky-700">{profile?.name}</b>.</p>
          <Button variant="white" onClick={handleSwitch}>Đổi người dùng</Button>
        </Card>
      </div>
    </div>
  )
}
