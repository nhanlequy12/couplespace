import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useAuth } from '../context/AuthContext'
import { useBucketList, BUCKET_STATUS } from '../hooks/useBucketList'
import { mapsSearchUrl } from '../lib/maps'
import { daysBetween, parseDateKey, formatVN, toDateKey } from '../lib/date'
import { Card, PageHeader, Button, IconButton, Chip, Input, Modal, EmptyState, Skeleton, useFeedback } from '../components/ui'

const EMOJIS = ['✨', '✈️', '🏖️', '⛰️', '🎡', '🎬', '🍳', '🐱', '🏠', '💍', '🎸', '📸', '🎂', '🛵', '🎄', '🧧']

function fireworks() {
  const end = Date.now() + 1800
  const colors = ['#38bdf8', '#0ea5e9', '#bae6fd', '#fde047', '#ffffff']
  const frame = () => {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors })
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

function BucketItem({ item, canDelete, onStatus, onComplete, onDelete }) {
  const done = item.status === 'completed'
  const target = parseDateKey(item.target_date)
  const daysLeft = target ? daysBetween(new Date(), target) : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className={`p-4 rounded-2xl border transition-all ${done ? 'bg-emerald-50/60 border-emerald-100' : 'bg-white/85 border-sky-100 hover:border-sky-300 hover:shadow-soft'}`}
    >
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-2xl leading-none mt-0.5">{item.emoji || '✨'}</span>
          <div className="min-w-0">
            <h3 className={`font-bold text-sm leading-snug ${done ? 'line-through text-emerald-700/70' : 'text-sky-900'}`}>{item.title}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Bởi {item.added_by}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {target && !done && (
                <span className={`pill text-[10px] ${daysLeft < 0 ? 'bg-rose-50 text-rose-500' : daysLeft <= 14 ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'}`}>
                  📅 {formatVN(target)} {daysLeft === 0 ? '· hôm nay!' : daysLeft > 0 ? `· còn ${daysLeft} ngày` : '· trễ rồi 🙈'}
                </span>
              )}
              {item.place && (
                <a href={mapsSearchUrl(item.place)} target="_blank" rel="noreferrer" className="pill text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                  📍 {item.place}
                </a>
              )}
              {done && item.completed_at?.toDate && (
                <span className="pill text-[10px] bg-emerald-100 text-emerald-700">🎉 {formatVN(item.completed_at.toDate())}</span>
              )}
            </div>
          </div>
        </div>
        {canDelete && <IconButton title="Xoá" onClick={() => onDelete(item)} className="-mr-1 -mt-1">✕</IconButton>}
      </div>

      <div className="flex gap-2">
        {item.status === 'dreaming' && (
          <Button variant="soft" size="sm" className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100" onClick={() => onStatus(item.id, 'planning')}>📝 Lên kế hoạch</Button>
        )}
        {item.status === 'planning' && (
          <>
            <Button variant="gray" size="sm" className="flex-1" onClick={() => onStatus(item.id, 'dreaming')}>Chưa vội</Button>
            <Button size="sm" className="flex-1" onClick={() => onComplete(item.id)}>🎉 Hoàn thành</Button>
          </>
        )}
        {done && (
          <Button variant="gray" size="sm" className="flex-1" onClick={() => onStatus(item.id, 'dreaming')}>Làm lại lần nữa ↺</Button>
        )}
      </div>
    </motion.div>
  )
}

export default function BucketListPage() {
  const { profile } = useAuth()
  const { items, loading, addItem, updateStatus, removeItem } = useBucketList()
  const { toast, confirm } = useFeedback()

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', emoji: '✨', target_date: '', place: '' })
  const [saving, setSaving] = useState(false)
  const [mobileTab, setMobileTab] = useState('dreaming')

  const canDelete = profile?.sex === 'male'

  const groups = {
    dreaming: items.filter(i => i.status === 'dreaming'),
    planning: items.filter(i => i.status === 'planning'),
    completed: items.filter(i => i.status === 'completed'),
  }
  const progress = items.length ? Math.round((groups.completed.length / items.length) * 100) : 0

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await addItem(form, profile?.name || 'Ai đó')
      setForm({ title: '', emoji: '✨', target_date: '', place: '' })
      setShowAdd(false)
      toast('Đã thêm vào bucket list ☁️')
    } catch { toast('Không lưu được, thử lại nha', 'error') }
    finally { setSaving(false) }
  }

  const handleComplete = async (id) => {
    try { await updateStatus(id, 'completed'); fireworks() } catch { toast('Lỗi rồi', 'error') }
  }

  const handleStatus = async (id, s) => {
    try { await updateStatus(id, s) } catch { toast('Lỗi rồi', 'error') }
  }

  const handleDelete = async (item) => {
    if (!(await confirm({ title: 'Xoá mục tiêu này?', message: item.title, confirmText: 'Xoá', danger: true }))) return
    try { await removeItem(item.id); toast('Đã xoá', 'info') } catch { toast('Không xoá được', 'error') }
  }

  const renderColumn = (status) => {
    const meta = BUCKET_STATUS[status]
    const list = groups[status]
    return (
      <div key={status} className="min-w-0">
        <h2 className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 ${meta.color}`}>
          {meta.emoji} {meta.label}
          <span className="pill bg-white/80 text-gray-500 text-[10px] py-0.5">{list.length}</span>
        </h2>
        <div className="space-y-3">
          <AnimatePresence>
            {list.map(item => (
              <BucketItem key={item.id} item={item} canDelete={canDelete} onStatus={handleStatus} onComplete={handleComplete} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
          {list.length === 0 && (
            <p className="text-xs text-gray-400 italic bg-white/40 rounded-2xl border border-dashed border-sky-200 p-4 text-center">
              {status === 'dreaming' ? 'Thêm một ước mơ mới nào!' : status === 'planning' ? 'Chưa có gì đang lên kế hoạch' : 'Chưa hoàn thành điều gì... cố lên!'}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        emoji="🌠"
        title="Bucket List"
        subtitle="Những điều đôi ta sẽ làm cùng nhau"
        action={<Button size="sm" onClick={() => setShowAdd(true)}>+ Thêm</Button>}
      />

      {/* Tiến độ */}
      <Card className="mb-5 sm:mb-6 py-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-bold text-sky-800">Tiến độ chinh phục</span>
          <span className="font-black text-sky-600">{groups.completed.length}/{items.length} · {progress}%</span>
        </div>
        <div className="h-3 rounded-full bg-sky-100 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 60, damping: 15 }} />
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState emoji="☁️" title="Bucket list đang trống." hint="Đi săn mây Đà Lạt, nuôi mèo, học nấu ăn chung..." action={<Button size="sm" onClick={() => setShowAdd(true)}>+ Thêm ước mơ đầu tiên</Button>} />
      ) : (
        <>
          {/* Mobile: tabs */}
          <div className="lg:hidden">
            <div className="flex bg-white/70 backdrop-blur p-1 rounded-2xl border border-white shadow-soft mb-4">
              {Object.entries(BUCKET_STATUS).map(([k, m]) => (
                <button key={k} onClick={() => setMobileTab(k)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${mobileTab === k ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky' : 'text-gray-500'}`}>
                  {m.emoji} {m.label.replace('Đang ', '').replace('Đã ', '')} ({groups[k].length})
                </button>
              ))}
            </div>
            {renderColumn(mobileTab)}
          </div>
          {/* Desktop: 3 cột kanban */}
          <div className="hidden lg:grid gap-5 lg:grid-cols-3">
            {renderColumn('dreaming')}
            {renderColumn('planning')}
            {renderColumn('completed')}
          </div>
        </>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Thêm ước mơ mới ☁️"
        footer={
          <div className="flex gap-2">
            <Button variant="gray" className="flex-1" onClick={() => setShowAdd(false)}>Huỷ</Button>
            <Button className="flex-1" form="add-bucket-form" type="submit" loading={saving} disabled={!form.title.trim()}>Thêm</Button>
          </div>
        }
      >
        <form id="add-bucket-form" onSubmit={handleAdd} className="space-y-4">
          <Input label="Điều muốn làm *" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Vd: Đi săn mây Đà Lạt" required autoFocus />
          <div>
            <span className="block text-xs font-bold text-sky-700 mb-1.5 ml-1">Icon</span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  className={`w-10 h-10 rounded-xl text-xl border transition-all ${form.emoji === e ? 'bg-sky-100 border-sky-400 scale-110' : 'bg-white border-sky-100 hover:bg-sky-50'}`}>{e}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Dự định khi nào?" type="date" min={toDateKey()} value={form.target_date} onChange={(e) => setForm(f => ({ ...f, target_date: e.target.value }))} />
            <Input label="Ở đâu? (mở được Google Maps)" value={form.place} onChange={(e) => setForm(f => ({ ...f, place: e.target.value }))} placeholder="Vd: Đà Lạt" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Cuối tuần này', 'Tháng này', 'Năm nay'].map(t => <Chip key={t} onClick={() => {
              const d = new Date()
              if (t === 'Cuối tuần này') d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7))
              else if (t === 'Tháng này') d.setDate(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())
              else { d.setMonth(11); d.setDate(31) }
              setForm(f => ({ ...f, target_date: toDateKey(d) }))
            }}>{t}</Chip>)}
          </div>
        </form>
      </Modal>
    </div>
  )
}
