import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useAuth } from '../context/AuthContext'
import { usePlaces } from '../hooks/usePlaces'
import { useDragScroll } from '../lib/useDragScroll'
import SlotReel from '../components/SlotReel'
import { placeMapUrl, placeDirectionsUrl, nearbyUrl, mapsSearchUrl, isMapsLink } from '../lib/maps'
import {
  Card, PageHeader, SectionTitle, Button, IconButton, Chip, ChipRow, Input, Textarea, Select,
  EmptyState, Skeleton, Modal, useFeedback,
} from '../components/ui'

const CATEGORIES = ['Cơm', 'Bún/Phở', 'Lẩu/Nướng', 'Ăn vặt', 'Món Âu', 'Món Hàn', 'Món Nhật', 'Ốc', 'Đồ chay', 'Cafe/Trà sữa', 'Khác']
const DISTRICTS = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Bình Thạnh', 'Phú Nhuận', 'Gò Vấp', 'Tân Bình', 'Thủ Đức', 'Bình Tân', 'Biên Hòa']
const PRICES = [
  { id: '', label: 'Chưa rõ' },
  { id: '$', label: '$ Bình dân' },
  { id: '$$', label: '$$ Vừa túi' },
  { id: '$$$', label: '$$$ Sang chảnh' },
]

const MapIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const RouteIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
)

/** Nút hành động Google Maps cho 1 quán */
function MapActions({ place, size = 'xs' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <a href={placeMapUrl(place)} target="_blank" rel="noreferrer"
        className={`inline-flex items-center gap-1 rounded-lg font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors ${size === 'xs' ? 'text-[11px] px-2 py-1' : 'text-sm px-3.5 py-2'}`}>
        <MapIcon /> Bản đồ
      </a>
      <a href={placeDirectionsUrl(place)} target="_blank" rel="noreferrer"
        className={`inline-flex items-center gap-1 rounded-lg font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors ${size === 'xs' ? 'text-[11px] px-2 py-1' : 'text-sm px-3.5 py-2'}`}>
        <RouteIcon /> Chỉ đường
      </a>
    </div>
  )
}

function PlaceCard({ place, canDelete, onDelete, onVisit, onFavorite }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col p-3.5 bg-white/85 rounded-2xl border border-sky-100 hover:border-sky-300 hover:shadow-soft transition-all"
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="font-bold text-sky-900 text-sm sm:text-base leading-tight flex items-center gap-1.5">
            {place.favorite && <span title="Yêu thích">💖</span>}
            <span className="truncate">{place.name}</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {place.added_by && `Bởi ${place.added_by}`}
            {place.visits > 0 && ` · đã ghé ${place.visits} lần`}
          </p>
        </div>
        <div className="flex items-center shrink-0 -mr-1">
          <IconButton title={place.favorite ? 'Bỏ yêu thích' : 'Yêu thích'} onClick={() => onFavorite(place)} className={place.favorite ? 'text-sky-500' : ''}>
            {place.favorite ? '💖' : '🤍'}
          </IconButton>
          {canDelete && <IconButton title="Xoá quán" onClick={() => onDelete(place)}>✕</IconButton>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        <span className="pill bg-sky-100 text-sky-700 text-[10px]">{place.category}</span>
        <span className="pill bg-cyan-50 text-cyan-700 text-[10px]">📍 {place.district}</span>
        {place.price && <span className="pill bg-amber-50 text-amber-700 text-[10px]">{place.price}</span>}
      </div>

      {place.address && <p className="text-xs text-gray-500 mb-2 truncate">🏠 {place.address}</p>}

      {place.note && (
        <div className="bg-yellow-50/80 border border-yellow-100 rounded-xl px-2.5 py-2 text-[11px] text-yellow-800 mb-2.5">
          📌 {place.note}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto">
        <MapActions place={place} />
        <button onClick={() => onVisit(place)} className="text-[11px] font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg px-2 py-1 transition-colors active:scale-95" title="Đánh dấu đã ghé">
          ✓ Đã ghé
        </button>
      </div>
    </motion.div>
  )
}

export default function ExplorePage() {
  const { profile } = useAuth()
  const { places, loading, addPlace, removePlace, markVisited, toggleFavorite } = usePlaces()
  const { toast, confirm } = useFeedback()

  const dragDistricts = useDragScroll()
  const dragCategories = useDragScroll()

  const [filterCat, setFilterCat] = useState('All')
  const [filterDist, setFilterDist] = useState('All')
  const [search, setSearch] = useState('')
  const [onlyNew, setOnlyNew] = useState(false)
  const [onlyFav, setOnlyFav] = useState(false)

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', category: CATEGORIES[0], district: DISTRICTS[12], link: '', note: '', address: '', price: '' })
  const [saving, setSaving] = useState(false)

  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [muted, setMuted] = useState(() => localStorage.getItem('cs_reel_muted') === '1')
  const reelRef = useRef(null)

  const canDelete = profile?.sex === 'male'

  const q = search.trim().toLowerCase()
  const filtered = places.filter(p =>
    (filterCat === 'All' || p.category === filterCat) &&
    (filterDist === 'All' || p.district === filterDist) &&
    (!onlyNew || !p.visits) &&
    (!onlyFav || p.favorite) &&
    (!q || [p.name, p.note, p.address, p.district, p.category].filter(Boolean).some(s => s.toLowerCase().includes(q)))
  )

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target ? e.target.value : e }))

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (form.link && !isMapsLink(form.link)) {
      if (!(await confirm({ title: 'Link lạ quá', message: 'Link này không giống link Google Maps. Vẫn lưu chứ?', confirmText: 'Lưu luôn' }))) return
    }
    setSaving(true)
    try {
      await addPlace(form, profile?.name || 'Ai đó')
      setForm({ name: '', category: CATEGORIES[0], district: DISTRICTS[12], link: '', note: '', address: '', price: '' })
      setShowAdd(false)
      toast(`Đã thêm "${form.name.trim()}" 🍽️`)
    } catch { toast('Không lưu được, thử lại nha', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (place) => {
    if (!(await confirm({ title: `Xoá "${place.name}"?`, message: 'Xoá rồi là mất luôn đó nha.', confirmText: 'Xoá', danger: true }))) return
    try { await removePlace(place.id); toast('Đã xoá quán', 'info') } catch { toast('Không xoá được', 'error') }
  }

  const handleVisit = async (place) => {
    try { await markVisited(place.id); toast(`Đã ghé ${place.name} ${place.visits + 1} lần 🥢`) } catch { toast('Lỗi rồi', 'error') }
  }

  const handleFavorite = async (place) => {
    try { await toggleFavorite(place.id, place.favorite) } catch { toast('Lỗi rồi', 'error') }
  }

  const handleRandom = () => {
    if (!filtered.length) { toast('Hong có quán nào hợp tiêu chí hết á 🥺', 'error'); return }
    // Ưu tiên quán yêu thích & quán chưa ghé một chút
    const pool = filtered.flatMap(p => Array(1 + (p.favorite ? 1 : 0) + (!p.visits ? 1 : 0)).fill(p))
    const pick = pool[Math.floor(Math.random() * pool.length)]
    setResult(null)
    setSpinning(true)
    reelRef.current?.spin(pick)
  }

  const handleLanded = (pick) => {
    setResult(pick)
    setSpinning(false)
    confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 }, colors: ['#7dd3fc', '#38bdf8', '#bae6fd', '#ffffff'] })
  }

  const toggleMuted = () => {
    setMuted(m => { localStorage.setItem('cs_reel_muted', m ? '0' : '1'); return !m })
  }

  const nearbyCat = filterCat === 'All' ? 'quán ăn' : filterCat

  return (
    <div>
      <PageHeader
        emoji="🍜"
        title="Hôm nay ăn gì?"
        subtitle={`${places.length} quán trong bộ sưu tập`}
        action={<Button size="sm" onClick={() => setShowAdd(true)}>+ Thêm quán</Button>}
      />

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-5">
        {/* Bộ lọc + random */}
        <div className="lg:col-span-2 min-w-0 space-y-5 lg:sticky lg:top-10 self-start">
          <Card>
            <SectionTitle emoji="🎯" right={
              (filterCat !== 'All' || filterDist !== 'All' || onlyNew || onlyFav) && (
                <button onClick={() => { setFilterCat('All'); setFilterDist('All'); setOnlyNew(false); setOnlyFav(false) }} className="text-xs font-bold text-sky-400 hover:text-sky-600">Xoá lọc</button>
              )
            }>Lọc theo</SectionTitle>

            <ChipRow drag={dragDistricts} className="mb-2">
              <Chip tone="rose" active={filterDist === 'All'} onClick={() => setFilterDist('All')}>📍 Mọi quận</Chip>
              {DISTRICTS.map(d => <Chip key={d} tone="rose" active={filterDist === d} onClick={() => setFilterDist(d)}>{d}</Chip>)}
            </ChipRow>
            <ChipRow drag={dragCategories} className="mb-3">
              <Chip active={filterCat === 'All'} onClick={() => setFilterCat('All')}>🍲 Mọi món</Chip>
              {CATEGORIES.map(c => <Chip key={c} active={filterCat === c} onClick={() => setFilterCat(c)}>{c}</Chip>)}
            </ChipRow>
            <div className="flex flex-wrap gap-2">
              <Chip active={onlyNew} onClick={() => setOnlyNew(v => !v)}>🆕 Chưa ghé</Chip>
              <Chip active={onlyFav} onClick={() => setOnlyFav(v => !v)}>💖 Yêu thích</Chip>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="mb-4 bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl border border-sky-200 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500">🎰 Vòng quay may mắn</p>
                <button onClick={toggleMuted} title={muted ? 'Bật tiếng' : 'Tắt tiếng'} className="text-sm leading-none text-sky-500 hover:text-sky-700 active:scale-90 transition-transform">
                  {muted ? '🔕' : '🔔'}
                </button>
              </div>

              <SlotReel ref={reelRef} items={filtered} onLanded={handleLanded} muted={muted} />

              <div className="min-h-[4.25rem] flex items-center justify-center text-center mt-3">
                <AnimatePresence mode="wait">
                  {spinning ? (
                    <motion.p key="spin" initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.1 }} className="text-sm font-bold text-sky-500 italic">
                      Hồi hộp quá... 🥁
                    </motion.p>
                  ) : result ? (
                    <motion.div key={result.id} initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} className="w-full">
                      <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-0.5">Đi ăn thôi 🎉</p>
                      <p className="text-xl sm:text-2xl font-black text-sky-700 break-words">{result.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{result.category} · {result.district}{result.price && ` · ${result.price}`}</p>
                      {result.note && <p className="text-[11px] text-yellow-800 bg-yellow-100/80 px-3 py-1 rounded-full mt-2 inline-block">📌 {result.note}</p>}
                      <div className="flex justify-center mt-2.5"><MapActions place={result} size="sm" /></div>
                    </motion.div>
                  ) : (
                    <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400 font-medium text-sm">
                      {filtered.length} quán đang chờ trên vòng quay 👇
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleRandom} disabled={spinning || !filtered.length} loading={spinning}>
              {spinning ? 'Đang quay...' : result ? '🎰 Quay lại phát nữa' : '🎰 QUAY RANDOM'}
            </Button>

            <a href={nearbyUrl(nearbyCat)} target="_blank" rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
              <MapIcon /> Hoặc tìm {nearbyCat.toLowerCase()} gần đây trên Google Maps
            </a>
          </Card>
        </div>

        {/* Danh sách */}
        <div className="lg:col-span-3 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-sky-300">🔍</span>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm quán, ghi chú, địa chỉ..." className="pl-10 py-2.5" />
            </div>
            <span className="text-xs font-bold text-sky-500 shrink-0">{filtered.length} quán</span>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              emoji="🍽️"
              title={places.length ? 'Không có quán nào hợp bộ lọc.' : 'Chưa có quán nào cả.'}
              hint="Thêm quán mới hoặc đổi bộ lọc nhé"
              action={<Button size="sm" onClick={() => setShowAdd(true)}>+ Thêm quán</Button>}
            />
          ) : (
            <motion.div layout className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence>
                {filtered.map(p => (
                  <PlaceCard key={p.id} place={p} canDelete={canDelete} onDelete={handleDelete} onVisit={handleVisit} onFavorite={handleFavorite} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Form thêm quán */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Thêm quán mới 🍽️"
        footer={
          <div className="flex gap-2">
            <Button variant="gray" className="flex-1" onClick={() => setShowAdd(false)}>Huỷ</Button>
            <Button className="flex-1" form="add-place-form" type="submit" loading={saving} disabled={!form.name.trim()}>Lưu quán</Button>
          </div>
        }
      >
        <form id="add-place-form" onSubmit={handleAdd} className="space-y-4">
          <Input label="Tên quán *" value={form.name} onChange={setF('name')} placeholder="Vd: Bún bò Cô Ba" required autoFocus />

          <div className="grid grid-cols-2 gap-3">
            <Select label="Quận" value={form.district} onChange={setF('district')}>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
            <Select label="Loại món" value={form.category} onChange={setF('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>

          <div>
            <span className="block text-xs font-bold text-sky-700 mb-1.5 ml-1">Giá cả</span>
            <div className="flex flex-wrap gap-2">
              {PRICES.map(p => <Chip key={p.id} active={form.price === p.id} onClick={() => setForm(f => ({ ...f, price: p.id }))}>{p.label}</Chip>)}
            </div>
          </div>

          <Input label="Địa chỉ" value={form.address} onChange={setF('address')} placeholder="Số nhà, đường... (giúp chỉ đường chính xác hơn)" />

          <div>
            <Input label="Link Google Maps" type="url" value={form.link} onChange={setF('link')} placeholder="https://maps.app.goo.gl/..." />
            <a
              href={form.name.trim() ? mapsSearchUrl(`${form.name} ${form.district} Hồ Chí Minh`) : 'https://www.google.com/maps'}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-1.5 ml-1 hover:underline"
            >
              <MapIcon /> Mở Google Maps để tìm & copy link (không bắt buộc, app tự tìm theo tên)
            </a>
          </div>

          <Textarea label="Ghi chú" rows={2} value={form.note} onChange={setF('note')} placeholder="Gửi xe free, nhớ đặt bàn, món ngon nhất..." />
        </form>
      </Modal>
    </div>
  )
}
