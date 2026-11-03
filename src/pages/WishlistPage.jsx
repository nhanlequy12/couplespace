import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useWishlist, PRIORITIES } from '../hooks/useWishlist'
import { imageSearchUrl } from '../lib/maps'
import { PageHeader, Button, IconButton, Chip, Input, Textarea, Modal, EmptyState, Skeleton, useFeedback } from '../components/ui'

const FALLBACK_EMOJI = ['🎁', '💝', '🛍️', '✨', '🧸', '💄', '👟', '🎧']

function WishImage({ item }) {
  const [broken, setBroken] = useState(false)
  const emoji = FALLBACK_EMOJI[item.title.length % FALLBACK_EMOJI.length]
  if (!item.imageUrl || broken) {
    return (
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-sky-100 via-sky-50 to-white flex items-center justify-center text-5xl select-none">
        {emoji}
      </div>
    )
  }
  return <img src={item.imageUrl} alt={item.title} loading="lazy" onError={() => setBroken(true)} className="w-full h-auto max-h-56 object-cover" />
}

function WishCard({ item, mine, onDelete, onSurprise, onUnsurprise }) {
  const pr = PRIORITIES[item.priority] || PRIORITIES.normal
  const surprised = item.status === 'surprised'
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} className="break-inside-avoid mb-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-sky-100 relative group">
        <WishImage item={item} />
        <span className="absolute top-2 left-2 pill bg-white/90 backdrop-blur text-[10px] shadow-sm">{pr.emoji} {pr.label}</span>
        {mine && (
          <IconButton title="Xoá" onClick={() => onDelete(item)} className="absolute top-1.5 right-1.5 bg-white/90 shadow-sm w-7 h-7 text-xs">✕</IconButton>
        )}

        <div className="p-3">
          <h3 className="font-bold text-sky-900 text-sm leading-snug">{item.title}</h3>
          {item.price && <p className="text-xs font-bold text-sky-500 mt-0.5">💰 {item.price}</p>}
          {item.note && <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{item.note}</p>}

          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.link && (
              <a href={item.link} target="_blank" rel="noreferrer" className="pill bg-orange-50 text-orange-600 text-[10px] hover:bg-orange-100">🛒 Chỗ bán</a>
            )}
            <a href={imageSearchUrl(item.title)} target="_blank" rel="noreferrer" className="pill bg-gray-50 text-gray-500 text-[10px] hover:bg-gray-100">🔍 Tìm ảnh</a>
          </div>

          {!mine && (
            surprised ? (
              <button onClick={() => onUnsurprise(item)} className="w-full mt-3 py-2 text-xs font-bold rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                Đã lén mua 🤫 (bấm để bỏ đánh dấu)
              </button>
            ) : (
              <Button size="sm" className="w-full mt-3" onClick={() => onSurprise(item)}>Lén chốt đơn ngay!</Button>
            )
          )}
        </div>

        {!mine && surprised && (
          <div className="absolute inset-x-0 top-0 h-[calc(100%-3.5rem)] bg-white/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="bg-white/95 text-sky-600 font-black px-4 py-2 rounded-full shadow-lg border border-sky-200 -rotate-12 text-xs tracking-wide">✔️ Đã lo liệu</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function WishlistPage() {
  const { profile, partner } = useAuth()
  const { items, loading, addItem, markAsSurprised, unmarkSurprised, removeItem } = useWishlist()
  const { toast, confirm } = useFeedback()

  const [tab, setTab] = useState('mine')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', link: '', imageUrl: '', price: '', priority: 'normal', note: '' })
  const [saving, setSaving] = useState(false)

  const uid = profile?.uid
  const myItems = items.filter(i => i.uid === uid)
  const partnerItems = items.filter(i => i.uid !== uid)
  const list = tab === 'mine' ? myItems : partnerItems
  const boughtCount = partnerItems.filter(i => i.status === 'surprised').length

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await addItem(uid, form)
      setForm({ title: '', link: '', imageUrl: '', price: '', priority: 'normal', note: '' })
      setShowAdd(false)
      setTab('mine')
      toast('Đã ném vào kho báu 🎁')
    } catch { toast('Không lưu được, thử lại nha', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!(await confirm({ title: 'Xoá khỏi wishlist?', message: item.title, confirmText: 'Xoá', danger: true }))) return
    try { await removeItem(item.id); toast('Đã xoá', 'info') } catch { toast('Không xoá được', 'error') }
  }

  const handleSurprise = async (item) => {
    if (!(await confirm({ title: 'Lén chốt đơn? 🤫', message: `"${item.title}" sẽ được đánh dấu là bạn đã lo. ${partner?.name || 'Nửa kia'} sẽ không thấy đâu.`, confirmText: 'Chốt!' }))) return
    try { await markAsSurprised(item.id); toast('Đã đánh dấu, nhớ giữ bí mật nha 🤫') } catch { toast('Lỗi rồi', 'error') }
  }

  const handleUnsurprise = async (item) => {
    try { await unmarkSurprised(item.id) } catch { toast('Lỗi rồi', 'error') }
  }

  return (
    <div>
      <PageHeader
        emoji="🎁"
        title="Kho Báu Bí Mật"
        subtitle="Thích gì cứ ném vào đây, khắc có người mua!"
        action={<Button size="sm" onClick={() => setShowAdd(true)}>+ Thêm món</Button>}
      />

      <div className="flex bg-white/70 backdrop-blur p-1.5 rounded-2xl border border-white shadow-soft mb-5 max-w-md">
        <button onClick={() => setTab('mine')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'mine' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky' : 'text-gray-500 hover:text-sky-500'}`}>
          Của mình ({myItems.length})
        </button>
        <button onClick={() => setTab('partner')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'partner' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky' : 'text-gray-500 hover:text-sky-500'}`}>
          Của {partner?.name || 'nửa kia'} 👀 ({partnerItems.length})
        </button>
      </div>

      {tab === 'partner' && partnerItems.length > 0 && (
        <p className="text-xs text-sky-500 font-semibold mb-4">🤫 Bạn đã lén lo {boughtCount}/{partnerItems.length} món. {partner?.name || 'Nửa kia'} không thấy trạng thái này đâu.</p>
      )}

      {loading ? (
        <div className="columns-2 sm:columns-3 xl:columns-4 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 mb-4 break-inside-avoid" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState
          emoji={tab === 'mine' ? '🛍️' : '📭'}
          title={tab === 'mine' ? 'Bạn chưa thèm món gì à?' : `${partner?.name || 'Nửa kia'} chưa thêm món nào.`}
          hint={tab === 'mine' ? 'Son, áo, giày, tai nghe... ném vào đi' : 'Chờ xíu nha'}
          action={tab === 'mine' && <Button size="sm" onClick={() => setShowAdd(true)}>+ Thêm món</Button>}
        />
      ) : (
        <div className="columns-2 sm:columns-3 xl:columns-4 gap-4">
          <AnimatePresence>
            {list.map(item => (
              <WishCard key={item.id} item={item} mine={tab === 'mine'} onDelete={handleDelete} onSurprise={handleSurprise} onUnsurprise={handleUnsurprise} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Thêm món đang thèm 🛍️"
        footer={
          <div className="flex gap-2">
            <Button variant="gray" className="flex-1" onClick={() => setShowAdd(false)}>Huỷ</Button>
            <Button className="flex-1" form="add-wish-form" type="submit" loading={saving} disabled={!form.title.trim()}>Lưu vào kho</Button>
          </div>
        }
      >
        <form id="add-wish-form" onSubmit={handleAdd} className="space-y-4">
          <Input label="Tên món đồ *" value={form.title} onChange={setF('title')} placeholder="Vd: Son MAC Ruby Woo, Áo polo..." required autoFocus />
          <div>
            <span className="block text-xs font-bold text-sky-700 mb-1.5 ml-1">Mức độ thèm</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRIORITIES).map(([k, p]) => (
                <Chip key={k} active={form.priority === k} onClick={() => setForm(f => ({ ...f, priority: k }))}>{p.emoji} {p.label}</Chip>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Giá khoảng" value={form.price} onChange={setF('price')} placeholder="Vd: 350k" />
            <Input label="Link Shopee / TikTok" type="url" value={form.link} onChange={setF('link')} placeholder="https://..." />
          </div>
          <div>
            <Input label="Link ảnh minh hoạ" type="url" value={form.imageUrl} onChange={setF('imageUrl')} placeholder="Dán link ảnh (không bắt buộc)" />
            {form.title.trim() && (
              <a href={imageSearchUrl(form.title)} target="_blank" rel="noreferrer" className="inline-block text-[11px] font-bold text-indigo-600 mt-1.5 ml-1 hover:underline">🔍 Tìm ảnh trên Google rồi copy link</a>
            )}
            {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-28 rounded-xl object-cover border border-sky-100" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
          </div>
          <Textarea label="Ghi chú" rows={2} value={form.note} onChange={setF('note')} placeholder="Màu, size, mua ở đâu rẻ..." />
        </form>
      </Modal>
    </div>
  )
}
