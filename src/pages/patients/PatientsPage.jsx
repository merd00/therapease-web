import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Plus, Trash2 } from 'lucide-react'
import patientService from '../../services/patientService'
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

export default function PatientsPage() {
  const [patients, setPatients]     = useState([])
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [newPatient, setNewPatient] = useState({ name: '', age: '', phone: '', status: 'Aktif' })
  const [saving, setSaving]         = useState(false)

  useEffect(() => { fetchPatients() }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const data = await patientService.getAll()
      setPatients(data)
    } catch (err) {
      toast.error('Danışanlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newPatient.name.trim()) {
      toast.warning('Lütfen danışan adını girin')
      return
    }
    try {
      setSaving(true)
      const created = await patientService.create({
        ...newPatient,
        age: newPatient.age ? parseInt(newPatient.age) : null,
      })
      setPatients([...patients, created])
      setNewPatient({ name: '', age: '', phone: '', status: 'Aktif' })
      setShowForm(false)
      toast.success('Danışan başarıyla eklendi')
    } catch (err) {
      toast.error('Danışan eklenemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu danışanı silmek istediğinize emin misiniz?')) return
    try {
      await patientService.delete(id)
      setPatients(patients.filter(p => p.id !== id))
      toast.success('Danışan silindi')
    } catch (err) {
      toast.error('Danışan silinemedi')
    }
  }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danışanlar</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-1">
            {patients.length} kayıtlı danışan
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {showForm ? 'İptal' : 'Yeni Danışan'}
        </button>
      </motion.div>

      {/* Yeni hasta formu */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Yeni Danışan ekle</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Ad Soyad *</label>
              <input
                type="text"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                placeholder="Ayşe Kaya"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Yaş</label>
              <input
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                placeholder="28"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Telefon</label>
              <input
                type="text"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                placeholder="0532 111 22 33"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Durum</label>
              <select
                value={newPatient.status}
                onChange={(e) => setNewPatient({ ...newPatient, status: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option>Aktif</option>
                <option>Yeni</option>
                <option>Pasif</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Plus size={15} />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </motion.div>
      )}

      {/* Arama */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Danışan ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Hasta listesi */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">Danışan</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">Yaş</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">Telefon</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">Durum</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
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
                </td>
              </tr>
            ) : (
              filtered.map((patient, index) => (
                <motion.tr
                  key={patient.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[index % avatarColors.length]}`}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-300">{patient.age || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-300">{patient.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${statusStyle[patient.status] || 'bg-gray-100 text-gray-500'}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Trash2 size={13} />
                      Sil
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

    </div>
  )
}