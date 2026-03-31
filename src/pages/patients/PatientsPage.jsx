import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Plus, Trash2, Pencil, Check, X, FileText, ChevronRight, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import patientService from '../../services/patientService'
import noteService from '../../services/noteService'
import { toast } from 'sonner'

const statusStyle = {
  'Aktif': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  'Yeni':  'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  'Pasif': 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

const avatarColors = [
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
]

const STATUS_FILTERS = ['Tümü', 'Aktif', 'Yeni', 'Pasif']
const SORT_OPTIONS   = [
  { value: 'name_asc',  label: 'İsim (A→Z)' },
  { value: 'name_desc', label: 'İsim (Z→A)' },
  { value: 'age_asc',   label: 'Yaş (küçük→büyük)' },
  { value: 'age_desc',  label: 'Yaş (büyük→küçük)' },
  { value: 'date_desc', label: 'En yeni kayıt' },
  { value: 'date_asc',  label: 'En eski kayıt' },
]

const PRESET_TAGS = ['Anksiyete', 'Depresyon', 'Travma', 'Çift terapisi', 'Aile', 'Stres', 'Fobia', 'OKB']

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function parseTags(tagsStr) {
  if (!tagsStr) return []
  return tagsStr.split(',').map(t => t.trim()).filter(Boolean)
}

function formatDateTR(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const inputClass = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"

export default function PatientsPage() {
  const navigate = useNavigate()

  const [patients, setPatients]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeFilter, setActiveFilter] = useState('Tümü')
  const [sortBy, setSortBy]       = useState('date_desc')

  // Yeni danışan formu
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: '', age: '', phone: '', status: 'Aktif', tags: ''
  })
  const [newTags, setNewTags]     = useState([])

  // Düzenleme modal
  const [editPatient, setEditPatient] = useState(null)
  const [editData, setEditData]       = useState({})
  const [editTags, setEditTags]       = useState([])
  const [editSaving, setEditSaving]   = useState(false)

  // Hızlı not modal
  const [notePatient, setNotePatient] = useState(null)
  const [noteContent, setNoteContent] = useState('')
  const [noteSaving, setNoteSaving]   = useState(false)

  useEffect(() => { fetchPatients() }, [])

  useEffect(() => {
    if (editPatient) {
      setEditData({
        name:   editPatient.name,
        age:    editPatient.age || '',
        phone:  editPatient.phone || '',
        status: editPatient.status,
      })
      setEditTags(parseTags(editPatient.tags))
    }
  }, [editPatient])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setPatients(await patientService.getAll())
    } catch { toast.error('Danışanlar yüklenemedi') }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!newPatient.name.trim()) { toast.warning('Danışan adı zorunludur'); return }
    try {
      setSaving(true)
      const created = await patientService.create({
        ...newPatient,
        age:  newPatient.age ? parseInt(newPatient.age) : null,
        tags: newTags.join(',') || null,
      })
      setPatients(prev => [created, ...prev])
      setNewPatient({ name: '', age: '', phone: '', status: 'Aktif', tags: '' })
      setNewTags([])
      setShowForm(false)
      toast.success('Danışan başarıyla eklendi')
    } catch { toast.error('Danışan eklenemedi') }
    finally { setSaving(false) }
  }

  const handleUpdate = async () => {
    if (!editData.name?.trim()) { toast.warning('Danışan adı zorunludur'); return }
    try {
      setEditSaving(true)
      const updated = await patientService.update(editPatient.id, {
        ...editData,
        age:  editData.age ? parseInt(editData.age) : null,
        tags: editTags.join(',') || null,
      })
      setPatients(prev => prev.map(p => p.id === updated.id ? updated : p))
      setEditPatient(null)
      toast.success('Danışan güncellendi')
    } catch { toast.error('Danışan güncellenemedi') }
    finally { setEditSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu danışanı silmek istediğinize emin misiniz?')) return
    try {
      await patientService.delete(id)
      setPatients(prev => prev.filter(p => p.id !== id))
      toast.success('Danışan silindi')
    } catch { toast.error('Danışan silinemedi') }
  }

  const handleQuickNote = async () => {
    if (!noteContent.trim()) { toast.warning('Not içeriği boş olamaz'); return }
    try {
      setNoteSaving(true)
      await noteService.create({
        patient_id: notePatient.id,
        content:    noteContent.trim(),
      })
      setNoteContent('')
      setNotePatient(null)
      toast.success('Not eklendi')
    } catch { toast.error('Not eklenemedi') }
    finally { setNoteSaving(false) }
  }

  const toggleTag = (tag, tagList, setTagList) => {
    setTagList(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // Filtrele + sırala
  const filtered = useMemo(() => {
    let list = patients.filter(p => {
      if (activeFilter !== 'Tümü' && p.status !== activeFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const inName  = p.name.toLowerCase().includes(q)
        const inPhone = p.phone?.toLowerCase().includes(q)
        const inTags  = p.tags?.toLowerCase().includes(q)
        if (!inName && !inPhone && !inTags) return false
      }
      return true
    })

    list.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':  return a.name.localeCompare(b.name)
        case 'name_desc': return b.name.localeCompare(a.name)
        case 'age_asc':   return (a.age || 0) - (b.age || 0)
        case 'age_desc':  return (b.age || 0) - (a.age || 0)
        case 'date_asc':  return new Date(a.created_at) - new Date(b.created_at)
        case 'date_desc': return new Date(b.created_at) - new Date(a.created_at)
        default: return 0
      }
    })
    return list
  }, [patients, activeFilter, search, sortBy])

  if (loading) return (
    <div className="p-8 space-y-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4 items-center bg-white dark:bg-gray-900 rounded-2xl p-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full" />
          <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="w-24 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-8 space-y-6">

      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danışanlar</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-1">
            {filtered.length === patients.length
              ? `${patients.length} kayıtlı danışan`
              : `${filtered.length} / ${patients.length} danışan gösteriliyor`}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setNewTags([]) }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {showForm ? 'İptal' : 'Yeni Danışan'}
        </button>
      </motion.div>

      {/* Yeni danışan formu */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Yeni Danışan Ekle</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Ad Soyad *</label>
                <input type="text" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} placeholder="Ayşe Kaya" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Yaş</label>
                <input type="number" value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} placeholder="28" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Telefon</label>
                <input type="text" value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} placeholder="0532 111 22 33" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Durum</label>
                <select value={newPatient.status} onChange={e => setNewPatient({ ...newPatient, status: e.target.value })} className={inputClass}>
                  <option>Aktif</option><option>Yeni</option><option>Pasif</option>
                </select>
              </div>
            </div>

            {/* Etiketler */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Etiketler <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS.map(tag => (
                  <button
                    key={tag} type="button"
                    onClick={() => toggleTag(tag, newTags, setNewTags)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      newTags.includes(tag)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCreate} disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Plus size={15} />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtre + arama + sıralama */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeFilter === f
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >{f}</button>
          ))}
          <select
            value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="ml-auto border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-xl px-3 py-2 text-sm font-semibold outline-none"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="İsim, telefon veya etiket ara..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Danışan listesi */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <Users size={24} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">
              {patients.length === 0 ? 'Henüz danışan eklenmemiş' : 'Sonuç bulunamadı'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {patients.length === 0 ? 'Yeni danışan ekle butonuna tıklayın' : 'Farklı bir arama deneyin'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Danışan</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Yaş</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Telefon</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Kayıt</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Durum</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient, index) => (
                <motion.tr
                  key={patient.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  {/* İsim + etiketler */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColors[index % avatarColors.length]}`}>
                        {getInitials(patient.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{patient.name}</p>
                        {patient.tags && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {parseTags(patient.tags).map(tag => (
                              <span key={tag} className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-lg">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-300">{patient.age || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-300">{patient.phone || '-'}</td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-400 dark:text-gray-500">{formatDateTR(patient.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${statusStyle[patient.status] || 'bg-gray-100 text-gray-500'}`}>
                      {patient.status}
                    </span>
                  </td>
                  {/* Aksiyonlar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-all">
                      {/* Hızlı not */}
                      <button
                        onClick={() => { setNotePatient(patient); setNoteContent('') }}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-white hover:bg-blue-500 px-2 py-1.5 rounded-lg transition-all"
                      >
                        <FileText size={11} />
                        Not
                      </button>
                      {/* Düzenle */}
                      <button
                        onClick={() => setEditPatient(patient)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-white hover:bg-emerald-500 px-2 py-1.5 rounded-lg transition-all"
                      >
                        <Pencil size={11} />
                        Düzenle
                      </button>
                      {/* Detay */}
                      <button
                        onClick={() => navigate(`/danisanlar/${patient.id}`)}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-500 px-2 py-1.5 rounded-lg transition-all"
                      >
                        <ChevronRight size={11} />
                        Detay
                      </button>
                      {/* Sil */}
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500 px-2 py-1.5 rounded-lg transition-all"
                      >
                        <Trash2 size={11} />
                        Sil
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Düzenleme Modal */}
      <AnimatePresence>
        {editPatient && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setEditPatient(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Danışanı Düzenle</h2>
                <button onClick={() => setEditPatient(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Ad Soyad *</label>
                  <input type="text" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Yaş</label>
                  <input type="number" value={editData.age || ''} onChange={e => setEditData({ ...editData, age: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Telefon</label>
                  <input type="text" value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Durum</label>
                  <select value={editData.status || 'Aktif'} onChange={e => setEditData({ ...editData, status: e.target.value })} className={inputClass}>
                    <option>Aktif</option><option>Yeni</option><option>Pasif</option>
                  </select>
                </div>
              </div>

              {/* Etiketler */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Etiketler</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map(tag => (
                    <button key={tag} type="button"
                      onClick={() => toggleTag(tag, editTags, setEditTags)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        editTags.includes(tag)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >{tag}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditPatient(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  Vazgeç
                </button>
                <button onClick={handleUpdate} disabled={editSaving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Check size={14} />
                  {editSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hızlı Not Modal */}
      <AnimatePresence>
        {notePatient && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setNotePatient(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Hızlı Not</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">{notePatient.name}</p>
                </div>
                <button onClick={() => setNotePatient(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <textarea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Hızlı not yazın..."
                rows={4} autoFocus
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setNotePatient(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  Vazgeç
                </button>
                <button onClick={handleQuickNote} disabled={noteSaving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Check size={14} />
                  {noteSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}